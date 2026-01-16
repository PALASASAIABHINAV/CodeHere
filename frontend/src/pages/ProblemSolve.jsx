import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Send, CheckCircle, XCircle, Clock, ArrowLeft, Code2, Eye } from 'lucide-react';

// Helper function to get default code template
const getDefaultTemplate = (problem, language) => {
  if (language === 'javascript') {
    return problem.template_js || problem.starter_code_js || `// Write your solution here\nvar solution = function() {\n    \n};`;
  } else if (language === 'cpp') {
    return problem.template_cpp || problem.starter_code_cpp || `// Write your solution here\nclass Solution {\npublic:\n    \n};`;
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
  const [loading, setLoading] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [showTestCaseDetails, setShowTestCaseDetails] = useState(false);

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
        
        // Load last accepted code if user solved it, otherwise load template
        if (data.problem.lastAcceptedCode) {
          setCode(data.problem.lastAcceptedCode);
        } else {
          setCode(getDefaultTemplate(data.problem, language));
        }
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem) {
      setCode(getDefaultTemplate(problem, newLang));
    }
  };

  const handleRun = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      
      // Refresh problem to update status
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
      setLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">Loading problem...</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900';
      case 'Medium': return 'text-yellow-400 bg-yellow-900';
      case 'Hard': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-800';
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
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dsa/problems')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold">{problem.title}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.userStatus === 'solved' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Play className="h-4 w-4" />
            {loading && !submitResult ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
            {loading && submitResult === null && testResult === null ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 flex">
            {['description', 'submissions', testResult || submitResult ? 'result' : null].filter(Boolean).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${
                  activeTab === tab
                    ? 'bg-gray-900 border-b-2 border-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Examples</h3>
                  {problem.examples && problem.examples.map((example, idx) => (
                    <div key={idx} className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">
                        <strong className="text-gray-300">Input:</strong> {example.input}
                      </p>
                      <p className="text-sm text-gray-400 mb-1">
                        <strong className="text-gray-300">Output:</strong> {example.output}
                      </p>
                      {example.explanation && (
                        <p className="text-sm text-gray-400 mt-2">
                          <strong className="text-gray-300">Explanation:</strong> {example.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags && problem.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {problem.companies && problem.companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.companies.map((company, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm border border-blue-700">
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
                      <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {sub.status === 'Accepted' ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span className={`font-semibold ${
                              sub.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {formatDate(sub.submitted_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Runtime: {sub.runtime}ms</span>
                          <span>Language: {sub.language}</span>
                        </div>
                        <details className="mt-3">
                          <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                            View Code
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-900 rounded text-sm overflow-x-auto border border-gray-700">
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
                  <div className={`p-4 rounded-lg border-2 ${
                    testResult.passed
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-red-900/20 border-red-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {testResult.passed ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                      <span className="text-lg font-semibold">{testResult.status}</span>
                    </div>
                    
                    {testResult.error ? (
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-red-300 font-mono text-sm">{testResult.error}</p>
                      </div>
                    ) : testResult.testCase ? (
                      <>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Input:</p>
                            <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                              {testResult.testCase.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Expected Output:</p>
                            <pre className="bg-gray-800 p-3 rounded text-sm">
                              {testResult.testCase.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Your Output:</p>
                            <pre className={`p-3 rounded text-sm ${
                              testResult.passed ? 'bg-green-900/30' : 'bg-red-900/30'
                            }`}>
                              {testResult.testCase.actualOutput}
                            </pre>
                          </div>
                          {testResult.testCase.explanation && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Explanation:</p>
                              <p className="text-sm text-gray-300">{testResult.testCase.explanation}</p>
                            </div>
                          )}
                          <p className="text-sm text-gray-400">Runtime: {testResult.runtime}ms</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {submitResult && (
                  <div className={`p-4 rounded-lg border-2 ${
                    submitResult.allPassed
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-red-900/20 border-red-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {submitResult.allPassed ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                      <span className="text-lg font-semibold">{submitResult.status}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-300">
                        Test Cases Passed: <span className="font-semibold">{submitResult.testsPassed} / {submitResult.totalTests}</span>
                      </p>
                      {submitResult.runtime && (
                        <p className="text-gray-300">
                          Average Runtime: <span className="font-semibold">{submitResult.runtime}ms</span>
                        </p>
                      )}
                      {submitResult.failedTestCase && (
                        <p className="text-red-400">
                          Failed on test case #{submitResult.failedTestCase}
                        </p>
                      )}
                    </div>

                    {submitResult.allPassed && (
                      <div className="mt-4 p-3 bg-green-800/50 rounded-lg border border-green-600">
                        <p className="font-semibold text-green-200">
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

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('javascript')}
                className={`px-3 py-1 text-sm rounded transition ${
                  language === 'javascript'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => handleLanguageChange('cpp')}
                className={`px-3 py-1 text-sm rounded transition ${
                  language === 'cpp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="C++ support coming soon"
                disabled
              >
                C++
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowTestCaseDetails(!showTestCaseDetails)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 transition"
              >
                <Eye className="h-4 w-4" />
                {showTestCaseDetails ? 'Hide' : 'Show'} Test Cases
              </button>
              {problem.test_cases && problem.test_cases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTestCase(idx)}
                  className={`px-3 py-1 text-sm rounded transition ${
                    selectedTestCase === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {showTestCaseDetails && problem.test_cases && problem.test_cases[selectedTestCase] && (
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="text-sm">
                <p className="text-gray-400 mb-2">
                  <strong>Test Case {selectedTestCase + 1}:</strong>
                </p>
                <div className="bg-gray-900 p-3 rounded">
                  <p className="text-gray-300 mb-2">
                    <strong>Input:</strong>
                  </p>
                  <pre className="text-gray-400 text-xs overflow-x-auto">
                    {problem.test_cases[selectedTestCase].input}
                  </pre>
                  <p className="text-gray-300 mt-3 mb-2">
                    <strong>Expected Output:</strong>
                  </p>
                  <pre className="text-gray-400 text-xs">
                    {problem.test_cases[selectedTestCase].output}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-gray-900 text-gray-100 font-mono text-sm focus:outline-none resize-none"
            spellCheck="false"
            placeholder="Write your code here..."
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;