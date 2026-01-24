import React, { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Eye, Search, Code2, Terminal, Coffee, FileCode,
  Layout, BookOpen, ListChecks, Braces, PlayCircle
} from "lucide-react";

const AdminProblemManager = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  // Section Management
  const [activeSection, setActiveSection] = useState("overview");
  const [activeTab, setActiveTab] = useState("javascript");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    difficulty: "Easy",
    description: "",
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: "",
    acceptance: "",
    hints: "",
    locked_testcases: 3,
    test_cases: [{ input: "", output: "", explanation: "" }],
    tags: "",
    companies: "",
    is_premium: false,
    template_js: "",
    template_cpp: "",
    template_java: "",
    template_python: "",
  });

  const sections = [
    { id: "overview", label: "Overview", icon: Layout },
    { id: "description", label: "Description", icon: BookOpen },
    { id: "examples", label: "Examples", icon: ListChecks },
    { id: "code", label: "Code Templates", icon: Braces },
    { id: "testcases", label: "Test Cases", icon: PlayCircle },
  ];

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/dsa/problems", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setProblems(data.problems);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      companies: formData.companies
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      examples: formData.examples.filter((ex) => ex.input || ex.output),
      test_cases: formData.test_cases.filter((tc) => tc.input || tc.output),
      locked_testcases: parseInt(formData.locked_testcases) || 3,
      acceptance: formData.acceptance || "0",
    };

    try {
      const url = editingProblem
        ? `http://localhost:5000/api/admin/problems/${editingProblem.id}`
        : "http://localhost:5000/api/admin/problems";

      const method = editingProblem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingProblem ? "Problem updated!" : "Problem created!");
        setShowModal(false);
        resetForm();
        fetchProblems();
      } else {
        alert(`Error: ${data.message || "Failed to save problem"}`);
      }
    } catch (error) {
      console.error("Error saving problem:", error);
      alert("Failed to save problem");
    }
  };

  const handleDelete = async (problemId) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/problems/${problemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Problem deleted successfully");
        fetchProblems();
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      description: problem.description,
      examples: problem.examples || [{ input: "", output: "", explanation: "" }],
      test_cases: problem.test_cases || [{ input: "", output: "", explanation: "" }],
      tags: problem.tags ? problem.tags.join(", ") : "",
      companies: problem.companies ? problem.companies.join(", ") : "",
      is_premium: problem.is_premium,
      template_js: problem.template_js || "",
      template_cpp: problem.template_cpp || "",
      template_java: problem.template_java || "",
      template_python: problem.template_python || "",
      constraints: problem.constraints || "",
      hints: problem.hints || "",
      acceptance: problem.acceptance || "0",
      locked_testcases: problem.locked_testcases || 3,
    });
    setActiveSection("overview");
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProblem(null);
    setFormData({
      title: "",
      slug: "",
      difficulty: "Easy",
      description: "",
      examples: [{ input: "", output: "", explanation: "" }],
      test_cases: [{ input: "", output: "", explanation: "" }],
      tags: "",
      companies: "",
      is_premium: false,
      template_js: "",
      template_cpp: "",
      template_java: "",
      template_python: "",
      constraints: "",
      hints: "",
      acceptance: "0",
      locked_testcases: 3,
    });
    setActiveSection("overview");
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Problems</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Problem
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{problem.title}</div>
                    <div className="text-sm text-gray-400 font-mono mt-0.5">{problem.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${problem.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                      problem.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                          {tag}
                        </span>
                      ))}
                      {problem.tags?.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">
                          +{problem.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {problem.is_premium && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm">
                        Premium
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/dsa/problem/${problem.slug}`, "_blank")}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(problem)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Section-Based Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden">

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProblem ? "Edit Problem" : "New Problem"}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${activeSection === section.id
                      ? "bg-white text-blue-600 border-l-4 border-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
                      }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                  {activeSection === "overview" && (
                    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h4>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="e.g. Two Sum"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                          <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            placeholder="e.g. two-sum"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                          <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Acceptance Rate (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.acceptance}
                            onChange={(e) => setFormData({ ...formData, acceptance: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                            placeholder="e.g. 45.5"
                          />
                        </div>
                        <div className="col-span-2 pt-2">
                          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.is_premium}
                              onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <div>
                              <span className="block text-sm font-semibold text-gray-900">Premium Problem</span>
                              <span className="block text-xs text-gray-500">Only accessible to premium members</span>
                            </div>
                          </label>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="Array, Hash Table, Dynamic Programming"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Companies (comma separated)</label>
                          <input
                            type="text"
                            value={formData.companies}
                            onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                            placeholder="Google, Amazon, Meta"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "description" && (
                    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Problem Statement</h4>

                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Markdown Supported)</label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="flex-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-mono text-sm leading-relaxed resize-none"
                          placeholder="# Problem Title&#10;&#10;Description goes here..."
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Constraints</label>
                          <textarea
                            rows={4}
                            value={formData.constraints}
                            onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                            placeholder="• 1 ≤ n ≤ 10^4"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Hints (comma separated)</label>
                          <textarea
                            rows={3}
                            value={formData.hints}
                            onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                            placeholder="Use a hash map..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "examples" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Examples</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              examples: [...formData.examples, { input: "", output: "", explanation: "" }],
                            })
                          }
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" /> Add Example
                        </button>
                      </div>

                      <div className="space-y-6">
                        {formData.examples.map((ex, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative group hover:shadow-md transition-all">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.examples.filter((_, idx) => idx !== i);
                                  setFormData({ ...formData, examples: updated });
                                }}
                                className="text-red-500 hover:bg-white hover:shadow-sm p-1.5 rounded-md transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Example {i + 1}</span>

                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Input</label>
                                <input
                                  type="text"
                                  value={ex.input}
                                  onChange={(e) => {
                                    const updated = [...formData.examples];
                                    updated[i].input = e.target.value;
                                    setFormData({ ...formData, examples: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="nums = [2,7,11,15], target = 9"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Output</label>
                                <input
                                  type="text"
                                  value={ex.output}
                                  onChange={(e) => {
                                    const updated = [...formData.examples];
                                    updated[i].output = e.target.value;
                                    setFormData({ ...formData, examples: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="[0,1]"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Explanation</label>
                                <textarea
                                  rows={2}
                                  value={ex.explanation}
                                  onChange={(e) => {
                                    const updated = [...formData.examples];
                                    updated[i].explanation = e.target.value;
                                    setFormData({ ...formData, examples: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSection === "code" && (
                    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Solution Templates</h4>
                      </div>

                      <div className="bg-gray-100 p-1 rounded-lg inline-flex self-start">
                        {[
                          { id: 'javascript', icon: Code2, label: 'JavaScript' },
                          { id: 'cpp', icon: Terminal, label: 'C++' },
                          { id: 'java', icon: Coffee, label: 'Java' },
                          { id: 'python', icon: FileCode, label: 'Python' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 relative border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {activeTab === 'javascript' && (
                          <textarea
                            value={formData.template_js}
                            onChange={(e) => setFormData({ ...formData, template_js: e.target.value })}
                            className="w-full h-full p-6 bg-slate-900 text-blue-300 outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="// JavaScript Solution Template"
                          />
                        )}
                        {activeTab === 'cpp' && (
                          <textarea
                            value={formData.template_cpp}
                            onChange={(e) => setFormData({ ...formData, template_cpp: e.target.value })}
                            className="w-full h-full p-6 bg-slate-900 text-green-300 outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="// C++ Solution Template"
                          />
                        )}
                        {activeTab === 'java' && (
                          <textarea
                            value={formData.template_java}
                            onChange={(e) => setFormData({ ...formData, template_java: e.target.value })}
                            className="w-full h-full p-6 bg-slate-900 text-orange-300 outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="// Java Solution Template"
                          />
                        )}
                        {activeTab === 'python' && (
                          <textarea
                            value={formData.template_python}
                            onChange={(e) => setFormData({ ...formData, template_python: e.target.value })}
                            className="w-full h-full p-6 bg-slate-900 text-yellow-300 outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="# Python Solution Template"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "testcases" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Test Cases</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              test_cases: [...formData.test_cases, { input: "", output: "", explanation: "" }],
                            })
                          }
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" /> Add Case
                        </button>
                      </div>

                      <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-yellow-800 mb-1">Locked Test Cases</label>
                          <p className="text-xs text-yellow-700">Test cases at or above this index will be hidden from users.</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={formData.locked_testcases}
                          onChange={(e) => setFormData({ ...formData, locked_testcases: parseInt(e.target.value) })}
                          className="w-20 px-3 py-2 bg-white border border-yellow-300 rounded-lg text-center font-bold text-yellow-900"
                        />
                      </div>

                      <div className="space-y-6">
                        {formData.test_cases.map((tc, i) => (
                          <div key={i} className={`border rounded-xl p-5 relative group transition-all ${i >= formData.locked_testcases
                            ? "bg-gray-50 border-gray-200"
                            : "bg-white border-blue-200 shadow-sm"
                            }`}>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.test_cases.filter((_, idx) => idx !== i);
                                  setFormData({ ...formData, test_cases: updated });
                                }}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${i >= formData.locked_testcases
                                ? "bg-gray-200 text-gray-600"
                                : "bg-blue-100 text-blue-700"
                                }`}>
                                Case {i + 1} {i >= formData.locked_testcases && "(Hidden)"}
                              </span>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Input</label>
                                <textarea
                                  rows={2}
                                  value={tc.input}
                                  onChange={(e) => {
                                    const updated = [...formData.test_cases];
                                    updated[i].input = e.target.value;
                                    setFormData({ ...formData, test_cases: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="Input args"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Output</label>
                                <input
                                  type="text"
                                  value={tc.output}
                                  onChange={(e) => {
                                    const updated = [...formData.test_cases];
                                    updated[i].output = e.target.value;
                                    setFormData({ ...formData, test_cases: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="Expected Result"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform active:scale-95"
                  >
                    {editingProblem ? "Save Changes" : "Create Problem"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemManager;