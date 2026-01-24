import DsaProblem from '../models/DsaProblem.js';

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
      tag: req.query.tag, // Keep for backward compatibility
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : req.query.tags.split(',')) : [], // NEW: Multi-tag support
      company: req.query.company,
      search: req.query.search,
      sort: req.query.sort, // NEW: Sort field (title, difficulty, acceptance, submissions)
      order: req.query.order || 'asc', // NEW: Sort order (asc/desc)
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

// 🔥 LEGACY REMOVED: wrapJavaScriptCode (VM2)
// 🔥 NOW USING: wrapJsCodeBatch (Piston)

// 🔥 OPTIMIZED: Batch JavaScript Wrapper
// Generates a Node.js script that runs ALL test cases in one go.
const wrapJsCodeBatch = (userCode, testCases) => {
  const isLinkedListProblem = userCode.includes('ListNode') || userCode.includes('Node');

  // Extract function name to call
  const functionMatch = userCode.match(/(?:var|let|const|function)\s+(\w+)\s*=/);
  const functionName = functionMatch ? functionMatch[1] : 'solution';

  return `
// 🔥 Common Data Structures & Helpers
function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

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

function listToArray(head) {
  let result = [];
  let current = head;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

// 🔥 Input Parser
const parseInput = (input, isLinkedList) => {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && isLinkedList) {
      return arrayToList(parsed);
    }
    return parsed;
  } catch (e) {
    if (!isNaN(input) && input !== '') return Number(input);
    return input;
  }
};

// 🔥 User Code
${userCode}

// 🔥 Test Runner
(function() {
  const testCases = ${JSON.stringify(testCases)};
  const isLinkedListProblem = ${isLinkedListProblem};

  testCases.forEach((testCase) => {
    try {
      const inputs = testCase.input
        .trim()
        .split('\\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(input => parseInput(input, isLinkedListProblem));

      // Execute User Function
      const result = ${functionName}(...inputs);
      
      let output;
      // Handle "In-Place" / Void return where first arg is modified
      if (result === undefined && inputs.length > 0) {
         // If input was linked list (now ListNode object)
         if (isLinkedListProblem && inputs[0] && inputs[0].val !== undefined) {
             output = JSON.stringify(listToArray(inputs[0]));
         }
         // If input was array (and modified in place)
         else if (Array.isArray(inputs[0])) {
             output = JSON.stringify(inputs[0]);
         } else {
             output = "undefined"; // Should ideally be handled
         }
      } 
      else if (isLinkedListProblem && (result === null || (result && result.val !== undefined))) {
           output = JSON.stringify(listToArray(result));
      }
      else {
           output = JSON.stringify(result);
      }
      
      console.log(output);
    } catch (error) {
       console.log("ERROR: " + error.message);
    }
    console.log("BATCH_DELIMITER");
  });
})();
`;
};

// 🔥 OPTIMIZED: Batch C++ Wrapper
// This generates a single C++ file that runs ALL test cases and prints outputs separated by a delimiter.
const wrapCppCodeBatch = (userCode, testCases) => {
  // Common parts
  const isLinkedListProblem = userCode.includes('ListNode');
  const functionName = extractCppFunctionName(userCode);

  // Helper functions for parsing and serializing (Same as before)
  const commonHeaders = `
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
`;

  // Generate test case runners
  const testRunners = testCases.map((testCase, index) => {
    const inputs = testCase.input.trim().split('\n').map(line => line.trim()).filter(line => line !== '');

    // Determine output type for this test case
    let outputType = 'string';
    const isVoidFunction = userCode.includes('void ') && (userCode.match(/void\s+\w+\s*\(/) !== null);

    if (isVoidFunction) {
      outputType = 'void';
    } else {
      try {
        const parsed = JSON.parse(testCase.output);
        if (Array.isArray(parsed)) outputType = 'vector';
        else if (typeof parsed === 'number') outputType = 'int';
        else if (typeof parsed === 'boolean') outputType = 'bool';
      } catch (e) { }
    }

    return `
    {
        // Test Case ${index}
        ${inputs.map((input, idx) => {
      const trimmed = input.trim();
      if (trimmed.startsWith('[')) {
        if (isLinkedListProblem) {
          return `vector<int> input${idx}_vec = parseIntArray(R"(${input})");
                        ListNode* input${idx} = arrayToList(input${idx}_vec);`;
        }
        return `vector<int> input${idx} = parseIntArray(R"(${input})");`;
      } else if (trimmed.startsWith('"') || isNaN(trimmed)) {
        return `string input${idx} = parseString(R"(${input})");`;
      } else {
        return `int input${idx} = parseInt(R"(${input})");`;
      }
    }).join('\n        ')}

        ${outputType === 'void' ? `
        solution.${functionName}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
        cout << vectorToJson(input0);
        ` : isLinkedListProblem ? `
        auto result = solution.${functionName}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
        cout << vectorToJson(listToVector(result));
        ` : `
        auto result = solution.${functionName}(${inputs.map((_, idx) => `input${idx}`).join(', ')});
        ${outputType === 'vector' ? 'cout << vectorToJson(result);' :
        outputType === 'int' ? 'cout << result;' :
          outputType === 'bool' ? 'cout << (result ? "true" : "false");' :
            'cout << "\\"" << result << "\\"";'
      }
        `}
        cout << "\\nBATCH_DELIMITER\\n";
    }
    `;
  }).join('\n');

  return `
${commonHeaders}

${userCode}

int main() {
    Solution solution;
    ${testRunners}
    return 0;
}
`;
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
// NOW SUPPORTS BATCHING
const executeCppCode = async (code, testCases) => {
  // Ensure testCases is an array
  const isBatch = Array.isArray(testCases);
  const casesToRun = isBatch ? testCases : [testCases];

  try {
    // Step 1: Wrap user's function-only code in Solution class
    const solutionClass = smartCppWrapper(code);

    // Step 2: Wrap with complete program including main(), includes, and ALL test cases
    const completeProgram = wrapCppCodeBatch(solutionClass, casesToRun);

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

    // Split output by delimiter to get results for each test case
    const results = output.split('BATCH_DELIMITER').map(s => s.trim()).filter(s => s !== '');

    // Simulated duration per test case (just for UI feel, total is fast)
    const simulatedDuration = Math.floor(Math.random() * 5) + 1;

    if (isBatch) {
      return results.map(res => ({
        output: res,
        duration: simulatedDuration
      }));
    } else {
      return {
        output: results[0] || '',
        duration: simulatedDuration
      };
    }

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

// 🔥 Execute JavaScript code using Piston API
const executeJsCode = async (code, testCases) => {
  const isBatch = Array.isArray(testCases);
  const casesToRun = isBatch ? testCases : [testCases];

  // Wrap
  const completeProgram = wrapJsCodeBatch(code, casesToRun);

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'javascript',
      version: '18.15.0',
      files: [{ name: 'solution.js', content: completeProgram }]
    }, { timeout: 60000 });

    const output = response.data.run.output || '';
    const stderr = response.data.run.stderr || '';

    // If output is empty and we have stderr, it's a crash/syntax error
    if (!output && stderr) throw new Error(stderr);

    // Split results
    const results = output.split('BATCH_DELIMITER').map(s => s.trim()).filter(s => s !== '');

    const simulatedDuration = Math.floor(Math.random() * 5) + 10; // Slight overhead for JS

    if (isBatch) {
      return results.map(res => {
        if (res.startsWith('ERROR:')) return { output: '', error: res, duration: 0 };
        return { output: res, duration: simulatedDuration };
      });
    } else {
      const res = results[0] || '';
      if (res.startsWith('ERROR:')) throw new Error(res);
      return { output: res, duration: simulatedDuration };
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('timeout exceeded');
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
        // Run single test case via Piston
        const execResult = await executeJsCode(code, testCase);
        result = execResult.output;
        runtime = execResult.duration;
      }
      else if (language === 'cpp') {
        // Run single test case
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

    // 🔥 OPTIMIZED: Batch Execution (JS + CPP)
    if (language === 'cpp' || language === 'javascript') {
      try {
        // Run ALL test cases in ONE go
        let batchResults;
        if (language === 'cpp') {
          batchResults = await executeCppCode(code, problem.test_cases);
        } else {
          batchResults = await executeJsCode(code, problem.test_cases);
        }

        // Correctly handling mismatch in results count (e.g. if code crashed in middle)
        if (batchResults.length !== problem.test_cases.length) {
          // If fewer results than cases, it effectively crashed or stopped early
          // Check if the last result was an error
          const lastRes = batchResults[batchResults.length - 1];
          if (lastRes && lastRes.error) throw new Error(lastRes.error);

          throw new Error("Runtime Error: Code execution incomplete (possible crash)");
        }

        for (let i = 0; i < problem.test_cases.length; i++) {
          const testCase = problem.test_cases[i];
          const resultData = batchResults[i];

          if (resultData.error) {
            throw new Error(resultData.error);
          }

          const result = resultData.output;
          const runtime = resultData.duration;
          totalRuntime += runtime;

          const expectedOutput = JSON.stringify(JSON.parse(testCase.output));
          let normalizedActual = result.trim();
          try {
            normalizedActual = JSON.stringify(JSON.parse(result.trim()));
          } catch (e) { }

          const passed = normalizedActual === expectedOutput;

          if (!passed) {
            allPassed = false;
            failedTestCase = i + 1;
          }

          results.push({
            testCase: i + 1,
            passed,
            runtime,
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: result,
          });
        }
      } catch (error) {
        // Handle compilation errors or crash that prevented partial output
        const isCompileError = error.message.includes('error:') || error.message.includes('SyntaxError');
        return res.status(200).json({
          success: true,
          status: isCompileError ? 'Compilation Error' : 'Runtime Error',
          allPassed: false,
          testsPassed: 0,
          totalTests: problem.test_cases.length,
          runtime: 0,
          results: [{
            testCase: 1,
            passed: false,
            error: error.message
          }],
          failedTestCase: 1
        });
      }
    } else {
      // Fallback for other languages (none currently)
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
