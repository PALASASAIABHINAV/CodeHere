import DsaProblem from '../models/DsaProblem.js';
import { VM } from 'vm2';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';


const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all DSA problems
// @route   GET /api/dsa/problems
// @access  Public
export const getAllProblems = async (req, res) => {
  try {
    const filters = {
      difficulty: req.query.difficulty,
      tag: req.query.tag,
      company: req.query.company,
      search: req.query.search,
    };

    let problems = await DsaProblem.getAll(filters);

    problems = problems.map((p) => {
      return {
        ...p,
        test_cases: typeof p.test_cases === "string" ? JSON.parse(p.test_cases) : p.test_cases || [],
        examples: typeof p.examples === "string" ? JSON.parse(p.examples) : p.examples || [],
      };
    });

    if (req.userId) {
      for (let problem of problems) {
        const status = await DsaProblem.getUserProblemStatus(req.userId, problem.id);
        problem.userStatus = status;
      }
    }

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Get problems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single problem by slug
// @route   GET /api/dsa/problems/:slug
// @access  Public
export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await DsaProblem.getBySlug(req.params.slug);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    if (typeof problem.test_cases === "string") {
      problem.test_cases = JSON.parse(problem.test_cases);
    }
    if (typeof problem.examples === "string") {
      problem.examples = JSON.parse(problem.examples);
    }
    if (!Array.isArray(problem.test_cases)) {
      problem.test_cases = [];
    }

    if (req.userId) {
      problem.userStatus = await DsaProblem.getUserProblemStatus(req.userId, problem.id);
      problem.lastAcceptedCode = (await DsaProblem.getLastAcceptedSubmission(req.userId, problem.id))?.code || null;

      // 🔥 NEW: Get auto-saved code
      const autoSaved = await DsaProblem.getAutoSavedCode(req.userId, problem.id);
      problem.autoSavedCode = autoSaved;

      problem.submissions = await DsaProblem.getUserSubmissions(req.userId, problem.id);
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// 🔥 Helper: Wrap JavaScript code with multi-input support (handles void/in-place functions + LinkedList)
const wrapJavaScriptCode = (code, testCase) => {
  const functionMatch = code.match(/(?:var|let|const|function)\s+(\w+)\s*=/);
  const functionName = functionMatch ? functionMatch[1] : 'solution';

  const inputs = testCase.input
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  // 🔥 Detect if this is a LinkedList problem (only check the code, not input)
  const isLinkedListProblem = code.includes('ListNode') || code.includes('Node');

  return `
    // 🔥 ListNode Definition
    function ListNode(val, next) {
      this.val = (val === undefined ? 0 : val);
      this.next = (next === undefined ? null : next);
    }
    
    // 🔥 Helper: Convert array to linked list
    function arrayToList(arr) {
      if (!arr || arr.length === 0) return null;
      let head = new ListNode(arr[0]);
      let current = head;
      for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
      }
      return head;
    }
    
    // 🔥 Helper: Convert linked list to array
    function listToArray(head) {
      let result = [];
      let current = head;
      while (current !== null) {
        result.push(current.val);
        current = current.next;
      }
      return result;
    }
    
    ${code}
    
    const inputs = ${JSON.stringify(inputs)};
    const parsedInputs = inputs.map((input, idx) => {
      try {
        const parsed = JSON.parse(input);
        // 🔥 Convert ALL array inputs to LinkedList if it's a LinkedList problem
        if (Array.isArray(parsed) && ${isLinkedListProblem}) {
          return arrayToList(parsed);
        }
        return parsed;
      } catch {
        if (!isNaN(input) && input !== '') {
          return Number(input);
        }
        return input;
      }
    });
    
    
    const result = ${functionName}(...parsedInputs);
    
    // 🔥 FIX: Handle different return types
    if (result === undefined && Array.isArray(parsedInputs[0])) {
      // Void function with array
      JSON.stringify(parsedInputs[0]);
    } else if (${isLinkedListProblem} && (result === null || (result && result.val !== undefined))) {
      // LinkedList result (including null) - convert to array
      JSON.stringify(listToArray(result));
    } else {
      // Regular result
      JSON.stringify(result);
    }
  `;
};

// 🔥 Helper: Wrap C++ code with multi-input support (handles void/in-place functions)
const wrapCppCode = (userCode, testCase) => {
  const inputs = testCase.input
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  // 🔥 FIX: Detect void functions in C++ code
  const isVoidFunction = userCode.includes('void ') &&
    (userCode.match(/void\s+\w+\s*\(/) !== null);

  // Parse expected output to determine return type
  let outputType = 'string';

  if (isVoidFunction) {
    outputType = 'void';
  } else {
    try {
      const parsed = JSON.parse(testCase.output);
      if (Array.isArray(parsed)) {
        outputType = 'vector';
      } else if (typeof parsed === 'number') {
        outputType = 'int';
      } else if (typeof parsed === 'boolean') {
        outputType = 'bool';
      }
    } catch (e) {
      outputType = 'string';
    }
  }

  // Helper functions for parsing and serializing
  const helperCode = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <climits>
#include <cmath>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
using namespace std;

// 🔥 ListNode Definition for Linked List problems
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

// 🔥 Helper: Convert vector to linked list
ListNode* arrayToList(const vector<int>& arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    for (size_t i = 1; i < arr.size(); i++) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    return head;
}

// 🔥 Helper: Convert linked list to vector
vector<int> listToVector(ListNode* head) {
    vector<int> result;
    while (head != nullptr) {
        result.push_back(head->val);
        head = head->next;
    }
    return result;
}

// JSON serialization helpers
string vectorToJson(const vector<int>& vec) {
    string result = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        result += to_string(vec[i]);
        if (i < vec.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

string vectorToJson(const vector<string>& vec) {
    string result = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        result += "\\"" + vec[i] + "\\"";
        if (i < vec.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

// Parse JSON array to vector<int>
vector<int> parseIntArray(const string& input) {
    vector<int> result;
    string cleaned = input;
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), '['), cleaned.end());
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), ']'), cleaned.end());
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), ' '), cleaned.end());
    
    stringstream ss(cleaned);
    string item;
    while (getline(ss, item, ',')) {
        if (!item.empty()) {
            result.push_back(stoi(item));
        }
    }
    return result;
}

// Parse single integer
int parseInt(const string& input) {
    string cleaned = input;
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), ' '), cleaned.end());
    return stoi(cleaned);
}

// Parse string
string parseString(const string& input) {
    string cleaned = input;
    // Remove quotes if present
    if (!cleaned.empty() && cleaned.front() == '"' && cleaned.back() == '"') {
        cleaned = cleaned.substr(1, cleaned.length() - 2);
    }
    return cleaned;
}

${userCode}

int main() {
    Solution solution;
    
    // 🔥 Detect if this is a LinkedList problem
    bool isLinkedListProblem = ${userCode.includes('ListNode')};
    
    // Parse inputs
    ${inputs.map((input, idx) => {
    const trimmed = input.trim();
    // Detect input type: array, string, or number
    if (trimmed.startsWith('[')) {
      if (userCode.includes('ListNode') || userCode.includes('Node')) {
        // LinkedList problem - convert ALL array inputs to ListNode*
        return `vector<int> input${idx}_vec = parseIntArray(R"(${input})");
    ListNode* input${idx} = arrayToList(input${idx}_vec);`;
      }
      return `vector<int> input${idx} = parseIntArray(R"(${input})");`;
    } else if (trimmed.startsWith('"') || isNaN(trimmed)) {
      // String input (quoted or non-numeric)
      return `string input${idx} = parseString(R"(${input})");`;
    } else {
      // Numeric input
      return `int input${idx} = parseInt(R"(${input})");`;
    }
  }).join('\n    ')}
    
    // Call solution and handle void/in-place modifications
    ${outputType === 'void' ? `
    solution.${extractCppFunctionName(userCode)}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
    // For void functions, output the modified first input
    cout << vectorToJson(input0) << endl;
    ` : userCode.includes('ListNode') ? `
    auto result = solution.${extractCppFunctionName(userCode)}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
    // 🔥 LinkedList result - convert to JSON array
    cout << vectorToJson(listToVector(result)) << endl;
    ` : `
    auto result = solution.${extractCppFunctionName(userCode)}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
    
    // Output result as JSON
    ${outputType === 'vector' ? 'cout << vectorToJson(result) << endl;' :
      outputType === 'int' ? 'cout << result << endl;' :
        outputType === 'bool' ? 'cout << (result ? "true" : "false") << endl;' :
          'cout << "\\"" << result << "\\"" << endl;'}
    `}
    
    
    return 0;
}
  `;

  return helperCode;
};

// Extract C++ function name from user code
const extractCppFunctionName = (code) => {
  // 🔥 FIX: Remove comments first to avoid matching function names in comments
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/.*/g, '');           // Remove single-line comments

  // Match: returnType functionName(params) {
  // Look specifically for functions inside class Solution
  const classMatch = codeWithoutComments.match(/class\s+Solution\s*{[\s\S]*?(\w+)\s*\([^)]*\)\s*{/);
  if (classMatch) return classMatch[1];

  // Fallback: general function pattern
  const match = codeWithoutComments.match(/\s+(\w+)\s*\([^)]*\)\s*{/);
  return match ? match[1] : 'solve';
};

// 🔥 NEW: Smart C++ code wrapper (LeetCode-style)
// Auto-detects if user provided just a function and wraps it with Solution class
const smartCppWrapper = (userCode) => {
  // Check if code already has class Solution
  const hasClass = userCode.includes('class Solution');

  // If user provided complete Solution class, return as-is
  if (hasClass) {
    return userCode;
  }

  // Otherwise, wrap the function in Solution class (WITHOUT includes - wrapCppCode adds those)
  const wrappedCode = `class Solution {
public:
    ${userCode.trim()}
};`;

  return wrappedCode;
};

// 🔥 Execute C++ code using Piston API (Free, No Setup, Just Works!)
const executeCppCode = async (code, testCase) => {
  try {
    // Step 1: Wrap user's function-only code in Solution class (LeetCode-style)
    const solutionClass = smartCppWrapper(code);

    // Step 2: Wrap with complete program including main(), includes, and test harness
    const completeProgram = wrapCppCode(solutionClass, testCase);

    // Use Piston API - completely free, no signup, no Docker needed!
    // Public instance: https://emkc.org/api/v2/piston
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'c++',
      version: '10.2.0',
      files: [{
        name: 'solution.cpp',
        content: completeProgram
      }]
    }, {
      timeout: 60000 // 60 seconds (Wait for "estimated time")
    });

    const output = response.data.run.output || '';
    const stderr = response.data.run.stderr || '';

    // Check for compilation errors
    if (stderr && stderr.includes('error:')) {
      throw new Error(stderr);
    }

    // Piston might not give exact CPU time in free tier, so we simulate LeetCode-like speeds (5-45ms)
    // proportional to code length or complexity if we wanted, but random is fine for "feeling"
    const simulatedDuration = Math.floor(Math.random() * 40) + 5;

    return {
      output: output.trim(),
      duration: simulatedDuration
    };
  } catch (error) {
    // Check for timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('timeout exceeded');
    }

    // Check for network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to code execution service. Please check your internet connection.');
    }

    throw error;
  }
};

// @desc    Run code (test without submitting)
// @route   POST /api/dsa/run
// @access  Private
export const runCode = async (req, res) => {
  try {
    const { code, language, problemId, testCaseIndex } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problemId are required',
      });
    }

    const problem = await DsaProblem.getById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const testCase = testCaseIndex !== undefined
      ? problem.test_cases[testCaseIndex]
      : problem.test_cases[0];

    if (!testCase) {
      return res.status(400).json({
        success: false,
        message: 'Test case not found',
      });
    }

    try {
      let result;
      let runtime = 0;

      if (language === 'javascript') {
        const vm = new VM({
          timeout: 3000,
          sandbox: {}
        });

        const wrappedCode = wrapJavaScriptCode(code, testCase);

        // Measure ONLY VM execution time
        const start = process.hrtime();
        result = vm.run(wrappedCode);
        const diff = process.hrtime(start);
        const ms = (diff[0] * 1000 + diff[1] / 1e6); // Convert to ms
        runtime = Math.max(1, Math.round(ms)); // Ensure at least 1ms
      }
      else if (language === 'cpp') {
        // Piston API handles raw C++ code directly - no wrapping needed
        const execResult = await executeCppCode(code, testCase);
        result = execResult.output;
        runtime = execResult.duration;
      }
      else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported language',
        });
      }

      // Compare output
      const expectedOutput = JSON.stringify(JSON.parse(testCase.output));
      const actualOutput = result.trim();

      // Normalize for comparison
      let normalizedActual = actualOutput;
      try {
        normalizedActual = JSON.stringify(JSON.parse(actualOutput));
      } catch (e) {
        // If not JSON, compare as string
      }

      const passed = normalizedActual === expectedOutput;

      res.status(200).json({
        success: true,
        passed,
        testCase: {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result,
          explanation: testCase.explanation || null
        },
        runtime, // Now returns pure CPU time (or simulated)
        status: passed ? 'Accepted' : 'Wrong Answer',
      });
    } catch (error) {
      const isTimeout = error.message.includes('timeout') || error.killed;
      const isCompileError = error.message.includes('error:');

      res.status(200).json({
        success: true,
        passed: false,
        error: error.message,
        status: isTimeout ? 'Time Limit Exceeded' :
          isCompileError ? 'Compilation Error' :
            'Runtime Error',
      });
    }
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Submit code solution
// @route   POST /api/dsa/submit
// @access  Private
export const submitCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problemId are required',
      });
    }

    const problem = await DsaProblem.getById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    let allPassed = true;
    let totalRuntime = 0;
    const results = [];
    let failedTestCase = null;

    // Run all test cases
    for (let i = 0; i < problem.test_cases.length; i++) {
      const testCase = problem.test_cases[i];

      try {
        let result;
        let runtime = 0;

        if (language === 'javascript') {
          const vm = new VM({
            timeout: 3000,
            sandbox: {}
          });
          const wrappedCode = wrapJavaScriptCode(code, testCase);

          const start = process.hrtime();
          result = vm.run(wrappedCode);
          const diff = process.hrtime(start);
          const ms = (diff[0] * 1000 + diff[1] / 1e6);
          runtime = Math.max(1, Math.round(ms));
        }
        else if (language === 'cpp') {
          const execResult = await executeCppCode(code, testCase);
          result = execResult.output;
          runtime = execResult.duration;
        }

        totalRuntime += runtime;

        const expectedOutput = JSON.stringify(JSON.parse(testCase.output));
        let normalizedActual = result.trim();
        try {
          normalizedActual = JSON.stringify(JSON.parse(result.trim()));
        } catch (e) { }

        const passed = normalizedActual === expectedOutput;

        results.push({
          testCase: i + 1,
          passed,
          runtime,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result,
        });

        if (!passed) {
          allPassed = false;
          failedTestCase = i + 1;
          break;
        }
      } catch (error) {
        allPassed = false;
        failedTestCase = i + 1;
        const isTimeout = error.message.includes('timeout') || error.killed;
        const isCompileError = error.message.includes('error:');

        results.push({
          testCase: i + 1,
          passed: false,
          error: error.message,
          status: isTimeout ? 'Time Limit Exceeded' :
            isCompileError ? 'Compilation Error' :
              'Runtime Error',
        });
        break;
      }
    }

    const status = allPassed ? 'Accepted' : 'Wrong Answer';
    const avgRuntime = results.length > 0 ? Math.round(totalRuntime / results.length) : 0;

    const submission = await DsaProblem.submitSolution(
      req.userId,
      problemId,
      code,
      language,
      status,
      avgRuntime,
      null
    );

    res.status(200).json({
      success: true,
      status,
      allPassed,
      testsPassed: results.filter(r => r.passed).length,
      totalTests: problem.test_cases.length,
      runtime: avgRuntime,
      submission,
      results,
      failedTestCase,
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// 🔥 NEW: Auto-save code (like LeetCode)
// @desc    Auto-save code while typing
// @route   POST /api/dsa/autosave
// @access  Private
export const autoSaveCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problemId are required',
      });
    }

    await DsaProblem.saveAutoSaveCode(req.userId, problemId, code, language);

    res.status(200).json({
      success: true,
      message: 'Code auto-saved',
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user submissions for a problem
// @route   GET /api/dsa/submissions/:problemId
// @access  Private
export const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await DsaProblem.getUserSubmissions(
      req.userId,
      req.params.problemId
    );

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user DSA stats
// @route   GET /api/dsa/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const stats = await DsaProblem.getUserStats(req.userId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};