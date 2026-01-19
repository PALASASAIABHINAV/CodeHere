import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Layout, Globe, ArrowRight, Clock, Star, Layers, Check } from 'lucide-react';

const FrontendProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/frontend-projects', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getIcon = (slug) => {
        if (slug.includes('business')) return <Code className="w-6 h-6 text-purple-600" />;
        if (slug.includes('newsletter')) return <Layout className="w-6 h-6 text-blue-600" />;
        if (slug.includes('gallery')) return <Globe className="w-6 h-6 text-pink-600" />;
        return <Layers className="w-6 h-6 text-gray-600" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600 animate-pulse">Loading WebDev Forge...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 pt-16 pb-12 mb-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold tracking-wide uppercase">
                            WebDev Forge
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Build Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Frontend Projects</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Move beyond simple tutorials. Code directly in the browser with our
                        advanced split-screen IDE, real-time preview, and automated requirement verification.
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col group cursor-pointer ${project.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}
                            onClick={() => navigate(`/frontend/project/${project.slug}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors relative">
                                    {getIcon(project.slug)}
                                    {project.is_completed && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${getDifficultyColor(project.difficulty)}`}>
                                    {project.difficulty}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {project.description}
                            </p>

                            <div className="mt-auto">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                    {project.tags.length > 3 && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                            +{project.tags.length - 3}
                                        </span>
                                    )}
                                </div>

                                <button className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${project.is_completed ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-900 text-white group-hover:bg-purple-600'}`}>
                                    {project.is_completed ? (
                                        <>Completed <Check className="w-4 h-4 ml-1" /></>
                                    ) : (
                                        <>Start Building <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FrontendProjects;
