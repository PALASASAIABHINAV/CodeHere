import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { ArrowLeft, Layout, Code2, Eye, Globe, Check, GripVertical, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import debounce from 'lodash/debounce';

const WebDevWorkspace = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [project, setProject] = useState(null);

    // Layout State
    const [splitPosition, setSplitPosition] = useState(50); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    // Tab States
    const [leftTab, setLeftTab] = useState('code'); // 'description' | 'code'
    const [rightTab, setRightTab] = useState('preview'); // 'preview' | 'expected'
    const [codeTab, setCodeTab] = useState('html'); // 'html' | 'css' | 'js'

    // Code Stats
    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');

    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

    // Fetch Project
    useEffect(() => {
        fetchProject();
        // eslint-disable-next-line
    }, [slug]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/frontend-projects/${slug}`, {
                credentials: 'include' // Needed to identify user for drafts
            });
            const data = await response.json();
            if (data.success) {
                setProject(data.project);

                // Load Saved Code if exists, else Starter Code
                if (data.project.saved_code) {
                    setHtmlCode(data.project.saved_code.html || '');
                    setCssCode(data.project.saved_code.css || '');
                    setJsCode(data.project.saved_code.js || '');
                } else {
                    setHtmlCode(data.project.starter_html || '');
                    setCssCode(data.project.starter_css || '');
                    setJsCode(data.project.starter_js || '');
                }

                setIsCompleted(data.project.user_status === 'completed');
                setRequirements(data.project.requirements.map(req => ({ ...req, met: false })));
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-Save Function (Debounced)
    const autoSaveCode = useCallback(
        debounce(async (pId, code) => {
            if (!user) return;
            setAutoSaveStatus('saving');
            try {
                const response = await fetch('http://localhost:5000/api/frontend-projects/autosave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ projectId: pId, code })
                });
                if (response.ok) {
                    setAutoSaveStatus('saved');
                } else {
                    setAutoSaveStatus('error');
                }
            } catch (error) {
                console.error('Autosave error:', error);
                setAutoSaveStatus('error');
            }
        }, 2000),
        [user]
    );

    // Trigger Autosave on Code Change
    useEffect(() => {
        if (!loading && project && user) {
            autoSaveCode(project.id, { html: htmlCode, css: cssCode, js: jsCode });
        }
    }, [htmlCode, cssCode, jsCode, project, user, loading]);

    // Drag Logic
    const startDrag = () => setIsDragging(true);
    const stopDrag = () => setIsDragging(false);

    const handleDrag = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Limit range 0% to 100%
        const clampedWidth = Math.min(Math.max(newLeftWidth, 0), 100);
        setSplitPosition(clampedWidth);
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', stopDrag);
        } else {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', stopDrag);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', stopDrag);
        };
    }, [isDragging, handleDrag]);


    // Validation Logic
    const validateCode = useCallback(() => {
        if (!project) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCode, 'text/html');

        const updatedReqs = requirements.map(req => {
            let isMet = false;
            try {
                if (req.selector === 'script:contains("addEventListener")') {
                    isMet = jsCode.includes('addEventListener');
                } else {
                    const elements = doc.querySelectorAll(req.selector);
                    isMet = elements.length >= (req.minCount || 1);
                }
            } catch (e) { isMet = false; }
            return { ...req, met: isMet };
        });
        setRequirements(updatedReqs);
    }, [htmlCode, cssCode, jsCode, project, requirements]);

    useEffect(() => {
        const timer = setTimeout(validateCode, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, [htmlCode, cssCode, jsCode]); // Depend only on code changes

    const srcDoc = `<html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}</script></body></html>`;

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/frontend-projects/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    projectId: project.id,
                    code: { html: htmlCode, css: cssCode, js: jsCode }
                })
            });
            const data = await response.json();
            if (data.success) setIsCompleted(true);
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !project) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

    const allMet = requirements.every(r => r.met);
    const metCount = requirements.filter(r => r.met).length;
    const progress = Math.round((metCount / requirements.length) * 100);

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden font-sans select-none">
            {/* Header */}
            <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-50 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/frontend/projects')} className="p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
                    <div>
                        <h1 className="text-sm font-bold text-gray-200">{project.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${project.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : project.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>{project.difficulty}</span>
                            {/* Autosave Status */}
                            {user && (
                                <div className="flex items-center gap-1 text-xs ml-2">
                                    {autoSaveStatus === 'saving' && <span className="text-blue-400 flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> Saving...</span>}
                                    {autoSaveStatus === 'saved' && <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>}
                                    {autoSaveStatus === 'error' && <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Error</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="flex items-center gap-4 flex-1 justify-center max-w-xl mx-auto px-4">
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${allMet ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-mono w-12">{progress}%</span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!allMet || submitting}
                    className={`px-6 py-1.5 rounded-md text-sm font-semibold transition disabled:opacity-50 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {submitting ? 'Sending...' : isCompleted ? 'Submit Again' : 'Submit'}
                </button>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>

                {/* LEFT PANEL */}
                <div style={{ width: `${splitPosition}%` }} className="flex flex-col min-w-0">
                    <div className="flex bg-[#1e1e1e] border-b border-gray-700 shrink-0">
                        <button onClick={() => setLeftTab('code')} className={`px-4 py-2 text-sm flex gap-2 items-center ${leftTab === 'code' ? 'bg-[#252526] text-white border-t-2 border-blue-500' : 'text-gray-400'}`}><Code2 className="w-4 h-4" /> Editor</button>
                        <button onClick={() => setLeftTab('description')} className={`px-4 py-2 text-sm flex gap-2 items-center ${leftTab === 'description' ? 'bg-[#252526] text-white border-t-2 border-blue-500' : 'text-gray-400'}`}><Layout className="w-4 h-4" /> Task</button>
                    </div>

                    <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col relative">
                        {leftTab === 'code' && (
                            <>
                                <div className="flex bg-[#252526] shrink-0">
                                    <button onClick={() => setCodeTab('html')} className={`px-4 py-1.5 text-xs font-mono border-r border-[#1e1e1e] ${codeTab === 'html' ? 'bg-[#1e1e1e] text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}>index.html</button>
                                    <button onClick={() => setCodeTab('css')} className={`px-4 py-1.5 text-xs font-mono border-r border-[#1e1e1e] ${codeTab === 'css' ? 'bg-[#1e1e1e] text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>styles.css</button>
                                    <button onClick={() => setCodeTab('js')} className={`px-4 py-1.5 text-xs font-mono border-r border-[#1e1e1e] ${codeTab === 'js' ? 'bg-[#1e1e1e] text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}>script.js</button>
                                </div>
                                <div className="flex-1 relative">
                                    <Editor
                                        height="100%"
                                        language={codeTab === 'js' ? 'javascript' : codeTab}
                                        theme="vs-dark"
                                        value={codeTab === 'html' ? htmlCode : codeTab === 'css' ? cssCode : jsCode}
                                        onChange={(val) => codeTab === 'html' ? setHtmlCode(val) : codeTab === 'css' ? setCssCode(val) : setJsCode(val)}
                                        options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
                                    />
                                </div>
                            </>
                        )}
                        {leftTab === 'description' && (
                            <div className="p-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-700">
                                <h3 className="text-xl font-bold mb-4">{project.title}</h3>
                                <p className="text-gray-300 mb-6 leading-relaxed">{project.description}</p>
                                <h4 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Requirements</h4>
                                <div className="space-y-2">
                                    {requirements.map((req, i) => (
                                        <div key={i} className={`flex gap-3 p-3 rounded border ${req.met ? 'bg-green-900/10 border-green-500/30' : 'bg-gray-800 border-gray-700'}`}>
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${req.met ? 'bg-green-500' : 'bg-gray-700'}`}>{req.met ? <Check className="w-3 h-3" /> : <span className="text-[10px]">{i + 1}</span>}</div>
                                            <span className={`text-sm ${req.met ? 'text-green-200' : 'text-gray-400'}`}>{req.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* DRAGGER */}
                <div
                    onMouseDown={startDrag}
                    className={`w-1 bg-[#007fd4] hover:bg-[#007fd4] cursor-col-resize z-50 flex items-center justify-center transition-colors ${isDragging ? 'bg-[#007fd4]' : 'bg-transparent hover:bg-opacity-50'}`}
                    style={{ position: 'absolute', left: `${splitPosition}%`, top: 0, bottom: 0, transform: 'translateX(-50%)' }}
                >
                    <GripVertical className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                </div>

                {/* RIGHT PANEL */}
                <div style={{ width: `${100 - splitPosition}%`, marginLeft: 'auto' }} className="flex flex-col min-w-0 bg-white">
                    <div className="flex bg-gray-100 border-b border-gray-200 shrink-0">
                        <button onClick={() => setRightTab('preview')} className={`px-4 py-2 text-sm flex gap-2 items-center ${rightTab === 'preview' ? 'bg-white text-gray-900 border-t-2 border-blue-500' : 'text-gray-500'}`}><Eye className="w-4 h-4" /> Live Preview</button>
                        <button onClick={() => setRightTab('expected')} className={`px-4 py-2 text-sm flex gap-2 items-center ${rightTab === 'expected' ? 'bg-white text-gray-900 border-t-2 border-blue-500' : 'text-gray-500'}`}><Globe className="w-4 h-4" /> Expected Output</button>
                    </div>

                    <div className="flex-1 bg-white relative overflow-hidden">
                        {rightTab === 'preview' ? (
                            <iframe title="preview" srcDoc={srcDoc} className="w-full h-full border-none" sandbox="allow-scripts" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 relative">
                                {project.expected_solution_url ? (
                                    <iframe
                                        src={project.expected_solution_url}
                                        className="w-full h-full border-none"
                                        title="Expected Output"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No expected output URL provided</div>
                                )}
                            </div>
                        )}
                        {/* Overlay to catch mouse events while dragging over iframes */}
                        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WebDevWorkspace;
