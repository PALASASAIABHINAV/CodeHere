import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, CheckCircle, Clock, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

const DsaProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]); // Store unfiltered problems for tag extraction
  const [allTags, setAllTags] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const tagDropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    difficulty: '',
    search: '',
    tags: [],
    company: '',
    sort: '',
    order: 'asc',
  });

  // Fetch User Info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
        else setUser(null);
      } catch (err) {
        setUser(null);
      } finally {
        setUserLoaded(true);
      }
    };

    fetchUser();
  }, []);

  // Fetch ALL problems once to populate tags/companies
  useEffect(() => {
    if (userLoaded) {
      fetchAllProblemsForFilters();
    }
  }, [userLoaded]);

  // Fetch filtered problems whenever filters change
  useEffect(() => {
    if (userLoaded) {
      fetchProblems();
    }
  }, [filters, userLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all problems to extract unique tags and companies
  const fetchAllProblemsForFilters = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/dsa/problems`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success) {
        let list = data.problems;

        if (!user?.is_prime) {
          list = list.filter(p => !p.is_premium);
        }

        setAllProblems(list);

        // Extract unique tags and companies
        const tags = new Set();
        const companies = new Set();
        list.forEach(p => {
          if (p.tags && Array.isArray(p.tags)) {
            p.tags.forEach(t => tags.add(t));
          }
          if (p.companies && Array.isArray(p.companies)) {
            p.companies.forEach(c => companies.add(c));
          }
        });

        setAllTags(Array.from(tags).sort());
        setAllCompanies(Array.from(companies).sort());
      }
    } catch (error) {
      console.error('Error fetching all problems:', error);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.company) params.append('company', filters.company);
      if (filters.sort) {
        params.append('sort', filters.sort);
        params.append('order', filters.order);
      }

      const response = await fetch(
        `http://localhost:5000/api/dsa/problems?${params}`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success) {
        let list = data.problems;

        if (!user?.is_prime) {
          list = list.filter(p => !p.is_premium);
        }

        setProblems(list);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const removeFilter = (type, value = null) => {
    if (type === 'tag') {
      setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== value) }));
    } else if (type === 'difficulty') {
      setFilters(prev => ({ ...prev, difficulty: '' }));
    } else if (type === 'company') {
      setFilters(prev => ({ ...prev, company: '' }));
    } else if (type === 'search') {
      setFilters(prev => ({ ...prev, search: '' }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: '',
      search: '',
      tags: [],
      company: '',
      sort: '',
      order: 'asc',
    });
  };

  const hasActiveFilters = filters.difficulty || filters.search || filters.tags.length > 0 || filters.company;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'solved') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status === 'attempted') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    return null;
  };

  const filteredTagsForDropdown = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DSA Problems</h1>
          <p className="text-gray-600">
            Practice data structures and algorithms problems • {allProblems.length} total problems
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">

            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-all"
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Topic/Tag Filter (Multi-select Dropdown) */}
            <div className="relative" ref={tagDropdownRef}>
              <div
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between transition-all"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                  <span className={`${filters.tags.length > 0 ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                    {filters.tags.length > 0 ? `${filters.tags.length} Topic${filters.tags.length > 1 ? 's' : ''}` : 'All Topics'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showTagDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showTagDropdown && (
                <div className="absolute z-50 mt-2 w-full min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <input
                      type="text"
                      placeholder="Search topics..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {filters.tags.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters(prev => ({ ...prev, tags: [] }));
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all ({filters.tags.length})
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredTagsForDropdown.length > 0 ? (
                      filteredTagsForDropdown.map((tag) => (
                        <label
                          key={tag}
                          className="flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={filters.tags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          />
                          <span className={`text-sm ${filters.tags.includes(tag) ? 'text-blue-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {tag}
                          </span>
                          {filters.tags.includes(tag) && (
                            <CheckCircle className="ml-auto h-4 w-4 text-blue-600" />
                          )}
                        </label>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-sm text-gray-500 text-center">
                        <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No topics found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Company Filter */}
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-all"
                value={filters.company}
                onChange={(e) =>
                  setFilters({ ...filters, company: e.target.value })
                }
              >
                <option value="">All Companies</option>
                {allCompanies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3 pb-4">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: '', label: 'Default' },
                { value: 'title', label: 'Title' },
                { value: 'difficulty', label: 'Difficulty' },
                { value: 'acceptance', label: 'Acceptance' },
                { value: 'submissions', label: 'Submissions' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    sort: option.value,
                    order: prev.sort === option.value && prev.order === 'asc' ? 'desc' : 'asc'
                  }))}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${filters.sort === option.value
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                  {filters.sort === option.value && (
                    <span className="ml-1">{filters.order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">Active Filters:</span>

                {filters.difficulty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    {filters.difficulty}
                    <button onClick={() => removeFilter('difficulty')} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {filters.company && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                    {filters.company}
                    <button onClick={() => removeFilter('company')} className="hover:bg-purple-100 rounded-full p-0.5 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {filters.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    {tag}
                    <button onClick={() => removeFilter('tag', tag)} className="hover:bg-green-100 rounded-full p-0.5 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}

                <button
                  onClick={clearAllFilters}
                  className="ml-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{problems.length}</span> problem{problems.length !== 1 ? 's' : ''}
            {hasActiveFilters && <span> (filtered from {allProblems.length} total)</span>}
          </div>
        )}

        {/* Problems Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">No problems found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acceptance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Companies
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {problems.map((problem) => (
                    <tr
                      key={problem.id}
                      className="hover:bg-blue-50/50 cursor-pointer transition-all duration-150"
                      onClick={() => navigate(`/dsa/problem/${problem.slug}`)}
                    >
                      <td className="px-6 py-4">
                        {getStatusIcon(problem.userStatus)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {problem.title}
                          </div>

                          {problem.is_premium && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded border border-yellow-200">
                              Premium
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {problem.tags && problem.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${filters.tags.includes(tag)
                                  ? 'text-blue-700 bg-blue-50 border-blue-200 font-medium'
                                  : 'text-gray-600 bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagToggle(tag);
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags && problem.tags.length > 4 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
                              +{problem.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {problem.acceptance_rate}%
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {problem.total_submissions} attempts
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {problem.companies && problem.companies.slice(0, 3).map((company, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 text-xs text-blue-700 bg-blue-50 rounded-full border border-blue-100"
                            >
                              {company}
                            </span>
                          ))}
                          {problem.companies && problem.companies.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{problem.companies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default DsaProblems;
