import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Send, CheckCircle, XCircle, Clock, ArrowLeft, Code2, Eye, Lock, Save, RotateCcw, Terminal, AlertCircle, CheckSquare } from 'lucide-react';
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

  // Bottom Panel State
  const [activeBottomTab, setActiveBottomTab] = useState('testcase'); // 'testcase' or 'result'

  // Results State
  const [testResult, setTestResult] = useState(null); // Stores run output
  const [submitResult, setSubmitResult] = useState(null); // Stores submit output
  const [activeResultIdx, setActiveResultIdx] = useState(0); // For tabbed view of multiple test cases

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0); // For viewing input cases manually
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
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
    }, 2000),
    [user]
  );

  const handleCodeChange = (value) => {
    setCode(value);
    if (user && problem) {
      autoSaveCode(value, language, problem.id);
    }
  };

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    if (problem) {
      if (problem.autoSavedCode && problem.autoSavedCode[newLang]) {
        setCode(problem.autoSavedCode[newLang].code);
      } else {
        setCode(getDefaultTemplate(problem, newLang));
      }
    }
  };

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
    setActiveBottomTab('result');
    setActiveResultIdx(0); // Reset to first tab

    try {
      const response = await fetch('http://localhost:5000/api/dsa/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          // Removed testCaseIndex to trigger batch run of first 3 cases
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Run error:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: 'Runtime Error',
        results: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTestResult(null);
    setSubmitResult(null);
    setActiveBottomTab('result');

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

      if (data.allPassed) {
        setTimeout(fetchProblem, 1000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitResult({
        success: false,
        error: error.message,
        status: 'Runtime Error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Resizing State
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [bottomHeight, setBottomHeight] = useState(40); // Percentage
  const [isDragging, setIsDragging] = useState(null); // 'col' or 'row'

  const containerRef = useRef(null);
  const rightContainerRef = useRef(null);

  // Drag Handlers
  const startResize = (direction, e) => {
    e.preventDefault();
    setIsDragging(direction);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      if (isDragging === 'col' && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
      } else if (isDragging === 'row' && rightContainerRef.current) {
        const containerRect = rightContainerRef.current.getBoundingClientRect();
        // Height from bottom
        const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;
        if (newHeight > 10 && newHeight < 85) setBottomHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-xl">Loading problem...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 h-16">
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

          {user && (
            <div className="flex items-center gap-2 text-sm ml-4">
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
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative select-none"
        style={{ cursor: isDragging === 'col' ? 'col-resize' : isDragging === 'row' ? 'row-resize' : 'default' }}
      >

        {/* Left Panel - Problem Description */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col bg-white border-r border-gray-200 min-w-[20%]"
        >
          {/* Overlay when dragging to prevent event trapping */}
          {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}

          <div className="bg-gray-50 border-b border-gray-200 flex shrink-0">
            {['description', 'submissions'].map((tab) => (
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
          </div>
        </div>

        {/* Vertical Splitter */}
        <div
          className="w-1.5 hover:bg-blue-500 bg-gray-200 cursor-col-resize z-20 flex items-center justify-center transition-colors hover:delay-100"
          onMouseDown={(e) => startResize('col', e)}
        >
          <div className="h-4 w-0.5 bg-gray-400 rounded-full" />
        </div>

        {/* Right Panel - Code Editor & Test Cases */}
        <div
          ref={rightContainerRef}
          style={{ width: `calc(${100 - leftWidth}% - 6px)` }} // Adjust for splitter
          className="flex flex-col h-full bg-white relative"
        >

          {/* Top Section - Editor */}
          <div className="flex flex-col min-h-0 relative flex-grow " style={{ height: `calc(100% - ${bottomHeight}% - 6px)` }}>
            {/* Login Overlay */}
            {!user && (
              <div className="absolute inset-0 bg-gray-900/98 z-50 flex items-center justify-center backdrop-blur-md">
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <Lock className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-white mb-3">Login Required</h2>
                    <p className="text-center text-gray-300 mb-8">
                      Sign in to unlock the code editor and start solving this problem.
                    </p>
                    <div className="space-y-3">
                      <button onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg">
                        <span>Login to Continue</span>
                      </button>
                      <button onClick={() => navigate(`/signup?redirect=${encodeURIComponent(window.location.pathname)}`)} className="w-full py-3.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg border border-gray-600">
                        Create Free Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Code Editor</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  disabled={!user}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-900 rounded disabled:opacity-50 font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>

                {user && (
                  <button
                    onClick={resetCode}
                    className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 rounded transition-colors"
                    title="Reset to Template"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
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
                  padding: { top: 10 }
                }}
              />
            </div>
          </div>

          {/* Horizontal Splitter */}
          <div
            className="h-1.5 hover:bg-blue-500 bg-gray-200 cursor-row-resize z-20 flex items-center justify-center transition-colors hover:delay-100 w-full"
            onMouseDown={(e) => startResize('row', e)}
          >
            <div className="w-4 h-0.5 bg-gray-400 rounded-full" />
          </div>

          {/* Bottom Section - Test Cases & Results */}
          <div
            style={{ height: `${bottomHeight}%` }}
            className="bg-gray-50 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-100 shrink-0">
              <button
                onClick={() => setActiveBottomTab('testcase')}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${activeBottomTab === 'testcase'
                    ? 'bg-white text-gray-900 border-t-2 border-t-blue-500'
                    : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <CheckSquare className="h-4 w-4" />
                Testcase
              </button>
              <button
                onClick={() => setActiveBottomTab('result')}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${activeBottomTab === 'result'
                    ? 'bg-white text-gray-900 border-t-2 border-t-blue-500'
                    : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Terminal className="h-4 w-4" />
                Test Result
                {(testResult || submitResult) && (
                  <span className={`absolute top-2 right-2 flex h-1.5 w-1.5`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${(testResult?.allPassed || submitResult?.allPassed) ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${(testResult?.allPassed || submitResult?.allPassed) ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                  </span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white relative">

              {!user && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <p className="text-gray-500">Sign in to run test cases</p>
                </div>
              )}

              {activeBottomTab === 'testcase' && (
                <div className="space-y-4">
                  {/* Case Selector */}
                  <div className="flex items-center gap-2 mb-4">
                    {problem.test_cases && problem.test_cases.slice(0, problem.locked_testcases || 3).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCase(idx)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedTestCase === idx
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Case Details */}
                  {problem.test_cases && problem.test_cases[selectedTestCase] && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Input</p>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm max-h-32 overflow-y-auto">
                          {problem.test_cases[selectedTestCase].input}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expected Output</p>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm max-h-32 overflow-y-auto">
                          {problem.test_cases[selectedTestCase].output}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeBottomTab === 'result' && (
                <div className="space-y-4">
                  {/* Placeholder if no run */}
                  {!testResult && !submitResult && !isRunning && !isSubmitting && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-8">
                      <Play className="h-8 w-8 mb-2 opacity-50" />
                      <p>Run your code to see results here</p>
                    </div>
                  )}

                  {/* Running State */}
                  {(isRunning || isSubmitting) && (
                    <div className="flex items-center justify-center gap-3 text-blue-600 mt-8">
                      <Clock className="h-6 w-6 animate-spin" />
                      <span className="font-medium">Executing your code...</span>
                    </div>
                  )}

                  {/* Run Results (TestResult state) */}
                  {testResult && (
                    <div className="animate-fade-in-up">
                      {/* Run Result Header */}
                      <div className="flex items-center gap-4 mb-4">
                        {testResult.error ? (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            <span className="text-xl font-bold">{testResult.status}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${testResult.allPassed ? 'text-green-500' : 'text-red-500'}`}>
                              {testResult.status}
                            </span>
                          </div>
                        )}
                        {!testResult.error && testResult.results && testResult.results.length > 0 && (
                          <span className="text-gray-400 text-sm bg-gray-100 px-2 py-1 rounded">
                            Runtime: {Math.max(...testResult.results.map(r => r.runtime || 0))} ms
                          </span>
                        )}
                      </div>

                      {/* Execution Error Message (Global) */}
                      {testResult.error && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                          <pre className="text-red-600 font-mono text-sm whitespace-pre-wrap">
                            {testResult.error}
                          </pre>
                        </div>
                      )}

                      {/* Tabbed Results for Multiple Cases */}
                      {!testResult.error && testResult.results && testResult.results.length > 0 && (
                        <>
                          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {testResult.results.map((res, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveResultIdx(idx)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap
                                                ${activeResultIdx === idx
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${res.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>

                          {/* Active Case Details */}
                          <div className="space-y-4 animate-fade-in">
                            {(() => {
                              const activeCase = testResult.results[activeResultIdx];
                              if (!activeCase) return null;
                              return (
                                <>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Input</p>
                                    <pre className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
                                      {activeCase.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Output</p>
                                    <pre className={`p-3 rounded-lg border font-mono text-sm overflow-x-auto ${activeCase.passed ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-red-50 border-red-200 text-red-800'
                                      }`}>
                                      {activeCase.actualOutput}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expected</p>
                                    <pre className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
                                      {activeCase.expectedOutput}
                                    </pre>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Submit Results (Kept as summary for now) */}
                  {submitResult && (
                    <div className={`p-4 rounded-lg border-2 ${submitResult.allPassed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                      }`}>
                      <div className="flex items-center gap-3 mb-4">
                        {submitResult.allPassed ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                          <span className={`text-xl font-bold ${submitResult.allPassed ? 'text-green-700' : 'text-red-700'}`}>
                            {submitResult.status}
                          </span>
                          {submitResult.runtime && (
                            <p className="text-sm text-gray-500 mt-1">Runtime: {submitResult.runtime}ms</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-white/50 p-3 rounded-lg">
                        <p className="text-gray-700 font-medium">
                          Test Cases: <span className="font-bold">{submitResult.testsPassed} / {submitResult.totalTests}</span>
                        </p>
                        {submitResult.failedTestCase && (
                          <div className="mt-2 text-red-600 text-sm">
                            <p align="center">Failed on test case #{submitResult.failedTestCase}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;