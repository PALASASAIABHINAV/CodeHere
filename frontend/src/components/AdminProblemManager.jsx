// components/AdminProblemManager.jsx - COMPLETE FIX
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";

const AdminProblemManager = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

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
  });

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
      constraints: problem.constraints || "",
      hints: problem.hints || "",
      acceptance: problem.acceptance || "0",
      locked_testcases: problem.locked_testcases || 3,
    });
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
      constraints: "",
      hints: "",
      acceptance: "0",
      locked_testcases: 3,
    });
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Problem
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{problem.title}</div>
                    <div className="text-sm text-gray-500">{problem.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      problem.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                      problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {problem.is_premium && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Premium</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/dsa/problem/${problem.slug}`, "_blank")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(problem)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full my-8">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingProblem ? "Edit Problem" : "Add New Problem"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Premium Problem</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Examples */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Examples *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          examples: [...formData.examples, { input: "", output: "", explanation: "" }],
                        })
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Example
                    </button>
                  </div>

                  {formData.examples.map((ex, i) => (
                    <div key={i} className="border rounded-lg p-4 mb-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Example {i + 1}</span>
                        {formData.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.examples.filter((_, idx) => idx !== i);
                              setFormData({ ...formData, examples: updated });
                            }}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {/* ⭐ MULTI-LINE TEXTAREA FOR INPUT */}
                      <label className="text-xs text-gray-600 block mb-1">
                        Input (use new lines for multiple values)
                      </label>
                      <textarea
                        className="px-3 py-2 border rounded-lg w-full mb-2 font-mono text-sm"
                        placeholder="[2,7,11,15]&#10;9"
                        rows={3}
                        value={ex.input}
                        onChange={(e) => {
                          const updated = [...formData.examples];
                          updated[i].input = e.target.value;
                          setFormData({ ...formData, examples: updated });
                        }}
                      />
                      
                      <label className="text-xs text-gray-600 block mb-1">Output</label>
                      <input
                        className="px-3 py-2 border rounded-lg w-full mb-2 font-mono text-sm"
                        placeholder="[0,1]"
                        value={ex.output}
                        onChange={(e) => {
                          const updated = [...formData.examples];
                          updated[i].output = e.target.value;
                          setFormData({ ...formData, examples: updated });
                        }}
                      />
                      
                      <textarea
                        className="px-3 py-2 border rounded-lg w-full"
                        placeholder="Explanation (optional)"
                        rows={2}
                        value={ex.explanation}
                        onChange={(e) => {
                          const updated = [...formData.examples];
                          updated[i].explanation = e.target.value;
                          setFormData({ ...formData, examples: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Rest of form fields (constraints, acceptance, hints, etc.) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Constraints</label>
                  <textarea
                    rows={3}
                    value={formData.constraints}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    placeholder="• 1 ≤ n ≤ 10^4&#10;• -10^9 ≤ arr[i] ≤ 10^9"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Acceptance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.acceptance}
                      onChange={(e) => setFormData({ ...formData, acceptance: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="45.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Visible Test Cases</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.locked_testcases}
                      onChange={(e) => setFormData({ ...formData, locked_testcases: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hints (comma-separated)</label>
                  <textarea
                    rows={3}
                    value={formData.hints}
                    onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                    placeholder="Try using a hash map, Think about two pointers"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Array, Hash Table, Two Pointers"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Companies (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.companies}
                      onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                      placeholder="Google, Amazon, Microsoft"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ⭐ TEST CASES WITH MULTI-LINE SUPPORT */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Test Cases *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          test_cases: [...formData.test_cases, { input: "", output: "", explanation: "" }],
                        })
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Test Case
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3 text-sm text-blue-800">
                    <strong>💡 Multi-Input Format:</strong> Use new lines for multiple inputs<br/>
                    Example: Line 1: [2,7,11,15], Line 2: 9
                  </div>

                  {formData.test_cases.map((tc, i) => (
                    <div key={i} className="border rounded-lg p-4 mb-2 bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">
                          Test Case {i + 1}
                          {i >= formData.locked_testcases && (
                            <span className="ml-2 text-xs text-red-600">(Hidden from users)</span>
                          )}
                        </span>
                        {formData.test_cases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.test_cases.filter((_, idx) => idx !== i);
                              setFormData({ ...formData, test_cases: updated });
                            }}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Input (one value per line)
                          </label>
                          <textarea
                            placeholder="[2,7,11,15]&#10;9"
                            value={tc.input}
                            rows={3}
                            onChange={(e) => {
                              const updated = [...formData.test_cases];
                              updated[i].input = e.target.value;
                              setFormData({ ...formData, test_cases: updated });
                            }}
                            className="px-3 py-2 border rounded-lg w-full font-mono text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Output</label>
                          <input
                            type="text"
                            placeholder="[0,1]"
                            value={tc.output}
                            onChange={(e) => {
                              const updated = [...formData.test_cases];
                              updated[i].output = e.target.value;
                              setFormData({ ...formData, test_cases: updated });
                            }}
                            className="px-3 py-2 border rounded-lg w-full font-mono text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Explanation (optional)</label>
                          <input
                            type="text"
                            placeholder="Why this output?"
                            value={tc.explanation || ""}
                            onChange={(e) => {
                              const updated = [...formData.test_cases];
                              updated[i].explanation = e.target.value;
                              setFormData({ ...formData, test_cases: updated });
                            }}
                            className="px-3 py-2 border rounded-lg w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Code Templates */}
                <div>
                  <label className="block text-sm font-medium mb-2">JavaScript Template</label>
                  <textarea
                    rows={4}
                    value={formData.template_js}
                    onChange={(e) => setFormData({ ...formData, template_js: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="var twoSum = function(nums, target) {&#10;    // Write your code here&#10;};"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">C++ Template</label>
                  <textarea
                    rows={4}
                    value={formData.template_cpp}
                    onChange={(e) => setFormData({ ...formData, template_cpp: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="class Solution {&#10;public:&#10;    vector<int> twoSum(vector<int>& nums, int target) {&#10;        // Write your code here&#10;    }&#10;};"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProblem ? "Update" : "Create"} Problem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemManager;