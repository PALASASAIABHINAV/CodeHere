import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Send, CheckCircle, XCircle, Clock, ArrowLeft, Code2, Eye, Lock, Save, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Editor from "@monaco-editor/react";
import debounce from 'lodash/debounce';

// Helper function to get default code template
const getDefaultTemplate = (problem, language) => {
  if (language === 'javascript') {
    return problem.template_js || `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    
};`;
  } else if (language === 'cpp') {
    return problem.template_cpp || `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`;
  } else if (language === 'java') {
    return problem.template_java || `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}`;
  } else if (language === 'python') {
    return problem.template_python || `class Solution:
    def twoSum(self, nums, target):
        # Write your code here
        pass`;
  }
  return '// Write your code here';
};

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('description');
  const [testResult, setTestResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  // 🔥 REFACTOR: Split loading states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [showTestCaseDetails, setShowTestCaseDetails] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 🔥 NEW: saved, saving, error
  const { user } = useAuthStore();

  const editorRef = useRef(null);

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/dsa/problems/${slug}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setProblem(data.problem);

        // 🔥 Load language-specific code: Auto-saved > Template
        // Never mix languages (e.g., don't show C++ code in JS editor)
        const currentLang = language;
        if (data.problem.autoSavedCode && data.problem.autoSavedCode[currentLang]) {
          setCode(data.problem.autoSavedCode[currentLang].code);
        } else {
          setCode(getDefaultTemplate(data.problem, currentLang));
        }
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  // 🔥 Auto-save function (debounced)
  const autoSaveCode = useCallback(
    debounce(async (codeToSave, lang, probId) => {
      if (!user || !codeToSave || !probId) return;

      setAutoSaveStatus('saving');

      try {
        const response = await fetch('http://localhost:5000/api/dsa/autosave', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: codeToSave,
            language: lang,
            problemId: probId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setAutoSaveStatus('saved');
        } else {
          setAutoSaveStatus('error');
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
      }
    }, 2000), // Save after 2 seconds of inactivity
    [user]
  );

  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value);

    // Trigger auto-save
    if (user && problem) {
      autoSaveCode(value, language, problem.id);
    }
  };

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);

    if (problem) {
      // Load auto-saved code for this language if exists, otherwise use template
      // Never show code from a different language
      if (problem.autoSavedCode && problem.autoSavedCode[newLang]) {
        setCode(problem.autoSavedCode[newLang].code);
      } else {
        setCode(getDefaultTemplate(problem, newLang));
      }
    }
  };

  // Reset code to template
  const resetCode = () => {
    if (window.confirm('Are you sure you want to reset the code to the template? All your changes will be lost.')) {
      const template = getDefaultTemplate(problem, language);
      setCode(template);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTestResult(null);
    setSubmitResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/dsa/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          testCaseIndex: selectedTestCase,
        }),
      });

      const data = await response.json();
      setTestResult(data);
      setActiveTab('result');
    } catch (error) {
      console.error('Run error:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: 'Error',
      });
      setActiveTab('result');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTestResult(null);
    setSubmitResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/dsa/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });

      const data = await response.json();
      setSubmitResult(data);
      setActiveTab('result');

      if (data.allPassed) {
        setTimeout(fetchProblem, 1000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitResult({
        success: false,
        error: error.message,
        status: 'Error',
      });
      setActiveTab('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-xl">Loading problem...</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dsa/problems')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold">{problem.title}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.userStatus === 'solved' && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}

          {/* 🔥 Auto-save indicator */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <span className="text-blue-400 flex items-center gap-1">
                  <Clock className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Saved
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Error
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {user && (
            <>
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition disabled:opacity-50"
              >
                {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Running...' : 'Run'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 flex">
            {['description', 'submissions', testResult || submitResult ? 'result' : null].filter(Boolean).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${activeTab === tab
                  ? 'bg-white border-b-2 border-blue-600 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Examples</h3>
                  {problem.examples && problem.examples.map((example, idx) => (
                    <div key={idx} className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-900">Input:</strong> {example.input}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong className="text-gray-900">Output:</strong> {example.output}
                      </p>
                      {example.explanation && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong className="text-gray-900">Explanation:</strong> {example.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Constraints</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line text-gray-700">
                      {problem.constraints}
                    </pre>
                  </div>
                )}

                {/* Always show acceptance section, even if 0% */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Acceptance Rate</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 font-bold">{problem.acceptance_rate}%</span>
                      <span className="text-sm text-gray-600">
                        {problem.total_accepted} accepted / {problem.total_submissions} submissions
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${problem.acceptance_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {problem.hints && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Hints</h3>
                    <div className="space-y-2">
                      {problem.hints.split(",").map((hint, idx) => (
                        <details key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <summary className="cursor-pointer text-gray-900 hover:text-blue-600 font-medium">
                            💡 Hint {idx + 1}
                          </summary>
                          <p className="mt-2 text-gray-600 pl-4">{hint.trim()}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags && problem.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {problem.companies && problem.companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.companies.map((company, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-100">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Your Submissions</h3>
                {problem.submissions && problem.submissions.length > 0 ? (
                  <div className="space-y-3">
                    {problem.submissions.map((sub, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {sub.status === 'Accepted' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {sub.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(sub.submitted_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Runtime: {sub.runtime}ms</span>
                          <span>Language: {sub.language}</span>
                        </div>
                        <details className="mt-3">
                          <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                            View Code
                          </summary>
                          <pre className="mt-2 p-3 bg-white rounded text-sm overflow-x-auto border border-gray-200">
                            <code>{sub.code}</code>
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No submissions yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'result' && (
              <div className="space-y-4">
                {testResult && (
                  <div className={`p-4 rounded-lg border-2 ${testResult.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {testResult.passed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className="text-lg font-semibold text-gray-900">{testResult.status}</span>
                    </div>

                    {testResult.error ? (
                      <div className="bg-white p-3 rounded border border-red-200">
                        <p className="text-red-600 font-mono text-sm">{testResult.error}</p>
                      </div>
                    ) : testResult.testCase ? (
                      <>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Input:</p>
                            <pre className="bg-white p-3 rounded text-sm overflow-x-auto border border-gray-200">
                              {testResult.testCase.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Expected Output:</p>
                            <pre className="bg-white p-3 rounded text-sm border border-gray-200">
                              {testResult.testCase.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Your Output:</p>
                            <pre className={`p-3 rounded text-sm border ${testResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}>
                              {testResult.testCase.actualOutput}
                            </pre>
                          </div>
                          {testResult.testCase.explanation && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                              <p className="text-sm text-gray-700">{testResult.testCase.explanation}</p>
                            </div>
                          )}
                          <p className="text-sm text-gray-600">Runtime: {testResult.runtime}ms</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {submitResult && (
                  <div className={`p-4 rounded-lg border-2 ${submitResult.allPassed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {submitResult.allPassed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className="text-lg font-semibold text-gray-900">{submitResult.status}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700">
                        Test Cases Passed: <span className="font-semibold">{submitResult.testsPassed} / {submitResult.totalTests}</span>
                      </p>
                      {submitResult.runtime && (
                        <p className="text-gray-700">
                          Average Runtime: <span className="font-semibold">{submitResult.runtime}ms</span>
                        </p>
                      )}
                      {submitResult.failedTestCase && (
                        <p className="text-red-600">
                          Failed on test case #{submitResult.failedTestCase}
                        </p>
                      )}
                    </div>

                    {submitResult.allPassed && (
                      <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                        <p className="font-semibold text-green-700">
                          🎉 Congratulations! Your solution passed all test cases!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Removed Professional Loading Overlay */}

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-white relative">
          {!user && (
            <div className="absolute inset-0 bg-gray-900/98 z-50 flex items-center justify-center backdrop-blur-md">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-center text-white mb-3">
                    Login Required
                  </h2>

                  <p className="text-center text-gray-300 mb-8">
                    Sign in to unlock the code editor and start solving this problem. Join thousands of developers improving their skills!
                  </p>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-300">Write and test code in real-time</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-300">Track your progress and submissions</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-300">Cloud-saved code (auto-save)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                    >
                      <span>Login to Continue</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>

                    <button
                      onClick={() => navigate(`/signup?redirect=${encodeURIComponent(window.location.pathname)}`)}
                      className="w-full py-3.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 border border-gray-600"
                    >
                      Create Free Account
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                        className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                      >
                        Sign in now
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
            <select
              disabled={!user}
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-900 rounded disabled:opacity-50 font-medium"
            >
              <option value="javascript">
                JavaScript (Node.js)
              </option>
              <option value="cpp">
                C++ (GCC 11.2)
              </option>
              <option value="java">
                Java (OpenJDK 15)
              </option>
              <option value="python">
                Python (3.10)
              </option>
            </select>

            {/* Reset Code Button */}
            {user && (
              <button
                onClick={resetCode}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded transition-colors ml-3"
                title="Reset to Template"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowTestCaseDetails(!showTestCaseDetails)}
                disabled={!user}
                className={`px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded flex items-center gap-2 transition ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Eye className="h-4 w-4" />
                {showTestCaseDetails ? 'Hide' : 'Show'} Test Cases
              </button>

              {user && problem.test_cases && problem.test_cases
                .slice(0, problem.locked_testcases || 3)
                .map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTestCase(idx)}
                    className={`px-3 py-1 text-sm rounded transition ${selectedTestCase === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
            </div>
          </div>

          {showTestCaseDetails && user && problem.test_cases && problem.test_cases[selectedTestCase] && (
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="text-sm">
                <p className="text-gray-600 mb-2">
                  <strong>Test Case {selectedTestCase + 1}:</strong>
                </p>
                <div className="bg-white border border-gray-200 p-3 rounded">
                  <p className="text-gray-900 mb-2">
                    <strong>Input:</strong>
                  </p>
                  <pre className="text-gray-700 text-xs overflow-x-auto">
                    {problem.test_cases[selectedTestCase].input}
                  </pre>
                  <p className="text-gray-900 mt-3 mb-2">
                    <strong>Expected Output:</strong>
                  </p>
                  <pre className="text-gray-700 text-xs">
                    {problem.test_cases[selectedTestCase].output}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <Editor
            height="100%"
            language={language === "javascript" ? "javascript" : language === "cpp" ? "cpp" : language === "java" ? "java" : "python"}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              automaticLayout: true,
              tabSize: language === 'cpp' ? 4 : 2,
              insertSpaces: true,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;