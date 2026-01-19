import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, X, Save, AlertCircle, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';

const AdminFrontendManager = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        difficulty: 'Easy',
        tags: [],
        requirements: [],
        expected_solution_url: '',
        starter_html: '',
        starter_css: '',
        starter_js: ''
    });

    const [currentTab, setCurrentTab] = useState('html');
    const [tagInput, setTagInput] = useState('');
    const [reqInput, setReqInput] = useState({ id: '', text: '', selector: '', minCount: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/frontend-projects', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) setProjects(data.projects);
        } catch (error) {
            console.error('Fetch projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingProject
                ? `http://localhost:5000/api/frontend-projects/${editingProject.id}`
                : 'http://localhost:5000/api/frontend-projects';

            const method = editingProject ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                fetchProjects();
                resetForm();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error saving project');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? This will remove all associated submissions.')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/frontend-projects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) fetchProjects();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            slug: project.slug,
            description: project.description,
            difficulty: project.difficulty,
            tags: project.tags || [],
            requirements: project.requirements || [],
            expected_solution_url: project.expected_solution_url || '',
            starter_html: project.starter_html || '',
            starter_css: project.starter_css || '',
            starter_js: project.starter_js || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            description: '',
            difficulty: 'Easy',
            tags: [],
            requirements: [],
            expected_solution_url: '',
            starter_html: '',
            starter_css: '',
            starter_js: ''
        });
        setEditingProject(null);
        setShowForm(false);
        setTagInput('');
        setReqInput({ id: '', text: '', selector: '', minCount: '' });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addRequirement = () => {
        if (reqInput.id && reqInput.text && reqInput.selector) {
            const newReq = {
                id: reqInput.id,
                text: reqInput.text,
                selector: reqInput.selector,
                ...(reqInput.minCount && { minCount: parseInt(reqInput.minCount) })
            };
            setFormData({ ...formData, requirements: [...formData.requirements, newReq] });
            setReqInput({ id: '', text: '', selector: '', minCount: '' });
        }
    };

    const removeRequirement = (index) => {
        setFormData({
            ...formData,
            requirements: formData.requirements.filter((_, i) => i !== index)
        });
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    const difficultyColors = {
        Easy: 'bg-green-100 text-green-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Hard: 'bg-red-100 text-red-800'
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="text-gray-600">Loading projects...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Frontend Projects</h2>
                    <p className="text-gray-600 mt-1">{projects.length} total projects</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    <Plus className="h-5 w-5" /> Create Project
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[project.difficulty]}`}>
                                        {project.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags?.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => navigate(`/frontend/project/${project.slug}`)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="View Project"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-6xl w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </h3>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="project-slug"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Solution URL</label>
                                    <input
                                        type="url"
                                        value={formData.expected_solution_url}
                                        onChange={(e) => setFormData({ ...formData, expected_solution_url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add a tag..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Requirements */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (Validation Rules)</label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Requirement ID"
                                            value={reqInput.id}
                                            onChange={(e) => setReqInput({ ...reqInput, id: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={reqInput.text}
                                            onChange={(e) => setReqInput({ ...reqInput, text: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="CSS Selector"
                                            value={reqInput.selector}
                                            onChange={(e) => setReqInput({ ...reqInput, selector: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Min Count (optional)"
                                            value={reqInput.minCount}
                                            onChange={(e) => setReqInput({ ...reqInput, minCount: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Add Requirement
                                    </button>

                                    <div className="space-y-2 mt-3">
                                        {formData.requirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded p-3">
                                                <div className="flex-1 text-sm">
                                                    <strong>{req.id}:</strong> {req.text}
                                                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{req.selector}</code>
                                                    {req.minCount && <span className="ml-2 text-gray-600">(min: {req.minCount})</span>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(idx)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Starter Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Starter Code</label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <div className="flex border-b border-gray-300 bg-gray-50">
                                        {['html', 'css', 'js'].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setCurrentTab(tab)}
                                                className={`flex-1 py-2 px-4 font-medium transition ${currentTab === tab
                                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {tab.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="h-64">
                                        <Editor
                                            height="100%"
                                            language={currentTab === 'js' ? 'javascript' : currentTab}
                                            value={formData[`starter_${currentTab}`]}
                                            onChange={(value) => setFormData({ ...formData, [`starter_${currentTab}`]: value || '' })}
                                            theme="vs-light"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                                >
                                    <Save className="h-5 w-5" />
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {filteredProjects.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No projects found matching your criteria</p>
                </div>
            )}
        </div>
    );
};

export default AdminFrontendManager;
