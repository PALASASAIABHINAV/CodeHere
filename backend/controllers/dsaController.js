import DsaProblem from '../models/DsaProblem.js';
import { VM } from 'vm2';

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

    // ⬇️ FIX 1: Convert JSONB strings into real arrays
    problems = problems.map((p) => {
      return {
        ...p,
        test_cases:
          typeof p.test_cases === "string"
            ? JSON.parse(p.test_cases)
            : p.test_cases || [],
        examples:
          typeof p.examples === "string"
            ? JSON.parse(p.examples)
            : p.examples || [],
      };
    });

    // ⬇️ FIX 2: Attach user status if logged in
    if (req.userId) {
      for (let problem of problems) {
        const status = await DsaProblem.getUserProblemStatus(
          req.userId,
          problem.id
        );
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

    // ⬇️ FIX: Convert JSONB to actual arrays
    if (typeof problem.test_cases === "string") {
      problem.test_cases = JSON.parse(problem.test_cases);
    }
    if (typeof problem.examples === "string") {
      problem.examples = JSON.parse(problem.examples);
    }
    if (!Array.isArray(problem.test_cases)) {
      problem.test_cases = [];
    }

    // User info
    if (req.userId) {
      problem.userStatus = await DsaProblem.getUserProblemStatus(req.userId, problem.id);
      problem.lastAcceptedCode = (await DsaProblem.getLastAcceptedSubmission(req.userId, problem.id))?.code || null;
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


// Helper function to wrap user code based on language
const wrapUserCode = (code, language, testCase, problemSlug) => {
  if (language === 'javascript') {
    // Extract function name from code (e.g., "twoSum", "isPalindrome")
    const functionMatch = code.match(/(?:var|let|const|function)\s+(\w+)\s*=/);
    const functionName = functionMatch ? functionMatch[1] : 'solution';

    // Parse test case input - split by newline for multiple inputs
    const inputs = testCase.input.trim().split('\n');
    
    // Build the wrapper
    return `
      ${code}
      
      // Parse inputs
      const inputs = ${JSON.stringify(inputs)};
      const parsedInputs = inputs.map(input => {
        try {
          return JSON.parse(input);
        } catch {
          return isNaN(input) ? input : Number(input);
        }
      });
      
      // Call the function with parsed inputs
      const result = ${functionName}(...parsedInputs);
      
      // Return as JSON string for comparison
      JSON.stringify(result);
    `;
  } else if (language === 'cpp') {
    // C++ execution not implemented yet
    throw new Error('C++ execution not supported yet');
  }
  
  throw new Error('Unsupported language');
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

    // Get problem
    const problem = await DsaProblem.getById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    if (language !== 'javascript') {
      return res.status(400).json({
        success: false,
        message: 'Only JavaScript is supported currently',
      });
    }

    // Get test case to run
    const testCase = testCaseIndex !== undefined 
      ? problem.test_cases[testCaseIndex]
      : problem.test_cases[0];

    try {
      const startTime = Date.now();
      
      // Execute code in sandbox
      const vm = new VM({
        timeout: 3000,
        sandbox: {}
      });

      // Wrap user code
      const wrappedCode = wrapUserCode(code, language, testCase, problem.slug);
      const result = vm.run(wrappedCode);
      const runtime = Date.now() - startTime;

      // Compare output
      const expectedOutput = JSON.stringify(JSON.parse(testCase.output));
      const actualOutput = result.trim();
      const passed = actualOutput === expectedOutput;

      res.status(200).json({
        success: true,
        passed,
        testCase: {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result,
          explanation: testCase.explanation || null
        },
        runtime,
        status: passed ? 'Accepted' : 'Wrong Answer',
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        passed: false,
        error: error.message,
        status: error.message.includes('timeout') ? 'Time Limit Exceeded' : 'Runtime Error',
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

    // Get problem with all test cases
    const problem = await DsaProblem.getById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    if (language !== 'javascript') {
      return res.status(400).json({
        success: false,
        message: 'Only JavaScript is supported currently',
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
        const startTime = Date.now();
        
        const vm = new VM({
          timeout: 3000,
          sandbox: {}
        });

        const wrappedCode = wrapUserCode(code, language, testCase, problem.slug);
        const result = vm.run(wrappedCode);
        const runtime = Date.now() - startTime;
        totalRuntime += runtime;

        const expectedOutput = JSON.stringify(JSON.parse(testCase.output));
        const actualOutput = result.trim();
        const passed = actualOutput === expectedOutput;

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
        results.push({
          testCase: i + 1,
          passed: false,
          error: error.message,
          status: error.message.includes('timeout') ? 'Time Limit Exceeded' : 'Runtime Error',
        });
        break;
      }
    }

    const status = allPassed ? 'Accepted' : 'Wrong Answer';
    const avgRuntime = results.length > 0 ? Math.round(totalRuntime / results.length) : 0;

    // Save submission to database
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