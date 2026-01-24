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

// 🔥 OPTIMIZED: Batch Java Wrapper
const wrapJavaCodeBatch = (userCode, testCases) => {
  const isLinkedListProblem = userCode.includes('ListNode');
  const functionMatch = userCode.match(/(?:public\s+)?(?:static\s+)?[\w<>[\]]+\s+(\w+)\s*\(/);
  const functionName = functionMatch ? functionMatch[1] : 'solve';

  const imports = `
import java.util.*;
import java.util.stream.*;
import java.io.*;
import java.math.*;
`;

  const helpersAndListNode = `
// 🔥 ListNode Definition
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Helpers {
    public static int[] parseIntArray(String input) {
        if (input.equals("[]")) return new int[0];
        String content = input.trim().substring(1, input.length() - 1);
        if (content.isEmpty()) return new int[0];
        String[] parts = content.split(",");
        int[] res = new int[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = Integer.parseInt(parts[i].trim());
        return res;
    }
    
    public static List<Integer> parseIntegerList(String input) {
        int[] arr = parseIntArray(input);
        List<Integer> list = new ArrayList<>();
        for(int i : arr) list.add(i);
        return list;
    }

    public static String parseString(String input) {
        if (input.length() >= 2 && input.startsWith("\\"") && input.endsWith("\\"")) {
            return input.substring(1, input.length() - 1);
        }
        return input;
    }
    
    public static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for(int i=1; i<arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    public static List<Integer> listToList(ListNode head) {
        List<Integer> res = new ArrayList<>();
        while(head != null) {
            res.add(head.val);
            head = head.next;
        }
        return res;
    }
    
    public static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) {
            return Arrays.toString((int[])obj);
        }
        if (obj instanceof List) {
            return obj.toString();
        }
        return String.valueOf(obj);
    }
}
`;

  const testRunners = testCases.map((testCase, index) => {
    const inputs = testCase.input.trim().split('\n').map(line => line.trim()).filter(line => line !== '');

    const parsedInputs = inputs.map((input, idx) => {
      const trimmed = input.trim();
      if (trimmed.startsWith('[')) {
        if (isLinkedListProblem) {
          return `ListNode input${idx} = Helpers.arrayToList(Helpers.parseIntArray("${input.replace(/"/g, '\\"')}"));`;
        }
        return `int[] input${idx} = Helpers.parseIntArray("${input.replace(/"/g, '\\"')}");`;
      } else if (trimmed.startsWith('"') || isNaN(trimmed)) {
        const safeInput = input.replace(/"/g, '\\"');
        return `String input${idx} = Helpers.parseString("${safeInput}");`;
      } else {
        return `int input${idx} = Integer.parseInt("${input}");`;
      }
    }).join('\n        ');

    const args = inputs.map((_, idx) => `input${idx}`).join(', ');

    let invocation;
    const isVoid = userCode.includes('void ' + functionName);

    if (isVoid) {
      if (isLinkedListProblem) {
        invocation = `solution.${functionName}(${args});
             System.out.println(Helpers.toJson(Helpers.listToList(input0)));`;
      } else {
        invocation = `solution.${functionName}(${args});
             System.out.println(Helpers.toJson(input0));`;
      }
    } else {
      if (isLinkedListProblem) {
        invocation = `ListNode result = solution.${functionName}(${args});
             System.out.println(Helpers.toJson(Helpers.listToList(result)));`;
      } else {
        invocation = `Object result = solution.${functionName}(${args});
             System.out.println(Helpers.toJson(result));`;
      }
    }

    return `
    {
        // Test Case ${index}
        try {
            ${parsedInputs}
            
            ${invocation}
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }
        System.out.println("BATCH_DELIMITER");
    }
    `;
  }).join('\n');

  return `
${imports}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        ${testRunners}
    }
}

${userCode}

${helpersAndListNode}
`;
};


// 🔥 OPTIMIZED: Batch Python Wrapper
const wrapPythonCodeBatch = (userCode, testCases) => {
  // Extract function name to call (ignore comments and __init__)
  const codeClean = userCode.replace(/#.*/g, '');
  const functionMatch = codeClean.match(/def\s+(?!__init__)(\w+)\s*\(/);
  const functionName = functionMatch ? functionMatch[1] : 'solve';
  const isLinkedListProblem = userCode.includes('ListNode');
  const isExplicitVoid = userCode.includes('-> None') || userCode.includes('->None');

  return `
import sys
import json
from typing import *

# 🔥 ListNode Definition
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 🔥 Helpers
def array_to_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def list_to_array(head):
    result = []
    current = head
    while current:
        result.append(current.val)
        current = current.next
    return result

def parse_input(input_str, is_linked_list):
    try:
        parsed = json.loads(input_str)
        if isinstance(parsed, list) and is_linked_list:
            return array_to_list(parsed)
        return parsed
    except:
        return input_str

# 🔥 User Code
${userCode}

# 🔥 Test Runner
def run_tests():
    test_cases = ${JSON.stringify(testCases)}
    is_linked_list_problem = ${isLinkedListProblem ? 'True' : 'False'}
    is_explicit_void = ${isExplicitVoid ? 'True' : 'False'}

    for test_case in test_cases:
        try:
            inputs_str = test_case['input'].strip().split('\\n')
            inputs = [parse_input(i, is_linked_list_problem) for i in inputs_str if i.strip()]
            
            # Instantiate Solution if class exists
            if 'Solution' in globals():
                sol = Solution()
                func = getattr(sol, '${functionName}')
                result = func(*inputs)
            else:
                result = globals()['${functionName}'](*inputs)
            
            # Handle Return
            output = None
            if result is None and isinstance(inputs[0], list) and not is_linked_list_problem:
                 output = json.dumps(inputs[0])
            elif is_linked_list_problem and isinstance(result, ListNode):
                 output = json.dumps(list_to_array(result))
            elif is_linked_list_problem and result is None:
                 if is_explicit_void and inputs:
                      output = json.dumps(list_to_array(inputs[0]))
                 else:
                      output = "[]"
            else:
                 output = json.dumps(result)
                 
            if output is None: output = json.dumps(result)

            print(output)
        except Exception as e:
            print(f"ERROR: {str(e)}")
        
        print("BATCH_DELIMITER")

if __name__ == "__main__":
    run_tests()
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

// 🔥 Execute Java code using Piston API
const executeJavaCode = async (code, testCases) => {
  const isBatch = Array.isArray(testCases);
  const casesToRun = isBatch ? testCases : [testCases];

  // Wrap
  const completeProgram = wrapJavaCodeBatch(code, casesToRun);

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'java',
      version: '15.0.2',
      files: [{ name: 'Main.java', content: completeProgram }]
    }, { timeout: 60000 });

    const output = response.data.run.output || '';
    const stderr = response.data.run.stderr || '';

    if (!output && stderr) throw new Error(stderr);

    const results = output.split('BATCH_DELIMITER').map(s => s.trim()).filter(s => s !== '');

    const simulatedDuration = Math.floor(Math.random() * 5) + 1; // Fast Java

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

// 🔥 Execute Python code using Piston API
const executePythonCode = async (code, testCases) => {
  const isBatch = Array.isArray(testCases);
  const casesToRun = isBatch ? testCases : [testCases];

  const completeProgram = wrapPythonCodeBatch(code, casesToRun);

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'python',
      version: '3.10.0',
      files: [{ name: 'solution.py', content: completeProgram }]
    }, { timeout: 60000 });

    const output = response.data.run.output || '';
    const stderr = response.data.run.stderr || '';

    if (!output && stderr) throw new Error(stderr);

    const results = output.split('BATCH_DELIMITER').map(s => s.trim()).filter(s => s !== '');

    const simulatedDuration = Math.floor(Math.random() * 5) + 1;

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

// @desc    Run code (test first 3 cases without submitting)
// @route   POST /api/dsa/run
// @access  Private
export const runCode = async (req, res) => {
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

    // 🔥 Run first 3 test cases (or less if fewer exist)
    const testCasesToRun = problem.test_cases.slice(0, 3);

    if (testCasesToRun.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases available',
      });
    }

    let batchResults;

    try {
      if (language === 'javascript') {
        batchResults = await executeJsCode(code, testCasesToRun);
      } else if (language === 'cpp') {
        batchResults = await executeCppCode(code, testCasesToRun);
      } else if (language === 'java') {
        batchResults = await executeJavaCode(code, testCasesToRun);
      } else if (language === 'python') {
        batchResults = await executePythonCode(code, testCasesToRun);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported language',
        });
      }

      // Process results
      const results = [];
      let allPassed = true;

      // Handle crashing or incomplete execution
      if (batchResults.length !== testCasesToRun.length) {
        const lastRes = batchResults[batchResults.length - 1];
        if (lastRes && lastRes.error) throw new Error(lastRes.error);
        throw new Error("Runtime Error: Execution incomplete");
      }

      for (let i = 0; i < testCasesToRun.length; i++) {
        const testCase = testCasesToRun[i];
        const resultData = batchResults[i];

        if (resultData.error) {
          results.push({
            testCase: i + 1,
            passed: false,
            error: resultData.error,
            status: 'Runtime Error'
          });
          allPassed = false;
          continue;
        }

        const result = resultData.output;
        const runtime = resultData.duration;

        const expectedOutput = JSON.stringify(JSON.parse(testCase.output));

        let normalizedActual = result.trim();
        try {
          // Try to normalize JSON if applicable
          normalizedActual = JSON.stringify(JSON.parse(result.trim()));
        } catch (e) { }

        const passed = normalizedActual === expectedOutput;
        if (!passed) allPassed = false;

        results.push({
          testCase: i + 1,
          passed,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result,
          runtime,
          status: passed ? 'Accepted' : 'Wrong Answer'
        });
      }

      res.status(200).json({
        success: true,
        allPassed,
        results,
        status: allPassed ? 'Accepted' : 'Wrong Answer'
      });

    } catch (error) {
      const isTimeout = error.message.includes('timeout') || error.killed;
      const isCompileError = error.message.includes('error:') || error.message.includes('SyntaxError');

      res.status(200).json({
        success: true,
        allPassed: false,
        error: error.message,
        status: isTimeout ? 'Time Limit Exceeded' : isCompileError ? 'Compilation Error' : 'Runtime Error',
        results: []
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

    // 🔥 OPTIMIZED: Batch Execution (JS + CPP + Java + Python)
    if (language === 'cpp' || language === 'javascript' || language === 'java' || language === 'python') {
      try {
        // Run ALL test cases in ONE go
        let batchResults;
        if (language === 'cpp') {
          batchResults = await executeCppCode(code, problem.test_cases);
        } else if (language === 'javascript') {
          batchResults = await executeJsCode(code, problem.test_cases);
        } else if (language === 'java') {
          batchResults = await executeJavaCode(code, problem.test_cases);
        } else if (language === 'python') {
          batchResults = await executePythonCode(code, problem.test_cases);
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
