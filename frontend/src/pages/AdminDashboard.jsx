import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Users, FileCode, TrendingUp, Activity, Crown, Shield,
  Calendar, BarChart3, PieChart, User, Eye, X, Medal,
  Trash2, Edit, Plus, Search, Code, Layout
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AdminProblemManager from '../components/AdminProblemManager';
import AdminFrontendManager from '../components/AdminFrontendManager';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const response = await fetch('http://localhost:5000/api/analytics/all', { credentials: 'include' });
        const data = await response.json();
        if (data.success) setAnalyticsData(data.data);
      } else if (activeTab === 'users') {
        const response = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
        const data = await response.json();
        if (data.success) setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleTogglePrime = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'revoke' : 'grant'} Prime status?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/prime`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrime: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error('Error toggling prime:', error);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error('Error toggling role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Analytics Profile View
  const viewUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/user-profile/${userId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.user);
        setShowUserProfile(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    Easy: '#10B981',
    Medium: '#F59E0B',
    Hard: '#EF4444'
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6" /> User Profile
              </h2>
              <button onClick={() => setShowUserProfile(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-2">
                {selectedUser.profile_picture_url ? (
                  <img
                    src={selectedUser.profile_picture_url}
                    alt={selectedUser.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                    <span className="text-xl font-bold text-blue-600">{selectedUser.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-bold text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-bold text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex gap-2 mt-1">
                    {selectedUser.is_prime ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        <Crown className="h-4 w-4" /> Prime
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">Free Member</span>
                    )}
                    {selectedUser.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        <Shield className="h-4 w-4" /> Admin
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rank</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const rank = analyticsData?.topPerformers?.findIndex(p => p.id === selectedUser.id);
                      if (rank === undefined || rank === -1) return <span className="text-gray-500">N/A</span>;
                      if (rank === 0) return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold"><Medal className="h-4 w-4" /> Gold</span>;
                      if (rank === 1) return <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold"><Medal className="h-4 w-4" /> Silver</span>;
                      if (rank === 2) return <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold"><Medal className="h-4 w-4" /> Bronze</span>;
                      return <span className="text-lg font-bold text-gray-900">#{rank + 1}</span>;
                    })()}
                  </div>
                </div>
                {/* Stats Updated */}
                <div>
                  <p className="text-sm text-gray-500">Problems Solved</p>
                  <p className="text-lg font-bold text-green-600">{selectedUser.problems_solved || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frontend Projects Completed</p>
                  <p className="text-lg font-bold text-purple-600">{selectedUser.projects_completed || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Activity</p>
                  <p className="text-lg font-bold text-blue-600">{selectedUser.total_submissions || 0}</p>
                </div>
              </div>

              {selectedUser.recent_submissions && selectedUser.recent_submissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5 text-gray-500" /> Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {selectedUser.recent_submissions.slice(0, 5).map((sub, idx) => (
                      <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-sm transition">
                        <div>
                          <p className="font-medium text-gray-900">{sub.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded text-xs uppercase font-semibold ${sub.type === 'Frontend' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                              {sub.type === 'Frontend' ? 'Project' : sub.language}
                            </span>
                            <span>{new Date(sub.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(sub.status === 'Accepted' || sub.status === 'completed') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {sub.status === 'completed' ? 'Completed' : sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage analytics, users, and platform content</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-100 p-1">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <BarChart3 className="h-5 w-5" /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'users'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Users className="h-5 w-5" /> User Management
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'problems'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FileCode className="h-5 w-5" /> Problem Management
            </button>
            <button
              onClick={() => setActiveTab('frontend')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'frontend'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Layout className="h-5 w-5" /> Frontend Projects
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && activeTab === 'analytics' && analyticsData && (
          <div className="space-y-8 animate-fade-in">
            {/* Platform Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-600">Active Users (7d)</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.platformMetrics.active_users_7d}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-600">Today's Submissions</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.platformMetrics.today_submissions}</p>
              </div>

              {/* Active Users (24h) */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-600">Active Users (24h)</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.platformMetrics.active_users_24h || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-orange-600" />
                  <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.platformMetrics.total_users || 0}
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.submissionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="accepted" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Outcomes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={analyticsData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'Accepted' ? COLORS.success : entry.status === 'Wrong Answer' ? COLORS.danger : COLORS.warning} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.purple} name="Submissions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Top Performers Leaderboard (Updated) */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🏆 Top Performers</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DSA Solved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frontend Projects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.topPerformers.slice(0, 5).map((performer, idx) => (
                        <tr key={performer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {idx === 0 && <Medal className="h-6 w-6 text-yellow-500" />}
                            {idx === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                            {idx === 2 && <Medal className="h-6 w-6 text-orange-700" />}
                            {idx > 2 && <span className="font-bold text-gray-600">#{idx + 1}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {performer.profile_picture_url ? (
                                <img src={performer.profile_picture_url} alt={performer.name} className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                  {performer.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{performer.name}</span>
                                  {performer.is_prime && <Crown className="h-3 w-3 text-yellow-500" />}
                                </div>
                                <div className="text-xs text-gray-500">{performer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-green-600">{performer.problems_solved || 0}</td>
                          <td className="px-6 py-4 font-semibold text-purple-600">{performer.projects_completed || 0}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => viewUserProfile(performer.id)} className="text-blue-600 hover:underline text-sm font-medium">
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Content */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Growth Chart - MOVED HERE */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="total_users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Registered Users ({users.length})</h3>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.profile_picture_url ? (
                              <img src={u.profile_picture_url} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{u.name.substring(0, 2).toUpperCase()}</div>
                            )}
                            <div className="font-medium text-gray-900">{u.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleTogglePrime(u.id, u.is_prime)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition ${u.is_prime
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                          >
                            {u.is_prime ? <><Crown className="h-3 w-3" /> Prime</> : 'Free'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition ${u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                          >
                            {u.role === 'admin' ? <><Shield className="h-3 w-3" /> Admin</> : 'User'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewUserProfile(u.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No users found matching "{userSearch}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Problem Management Content */}
        {!loading && activeTab === 'problems' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Difficulty</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={analyticsData.problemStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ difficulty, count }) => `${difficulty}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.problemStats.map((entry, index) => {
                        const difficultyKey = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1).toLowerCase();
                        return <Cell key={`cell-${index}`} fill={COLORS[difficultyKey] || '#8884d8'} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Usage</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.languageStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="language" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total_submissions" fill={COLORS.primary} name="Submissions" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Topics</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.tagPopularity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="tag" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <AdminProblemManager />
          </div>
        )}

        {/* Frontend Projects Management Content */}
        {!loading && activeTab === 'frontend' && (
          <div className="space-y-8">
            {/* Analytics Charts */}
            {analyticsData && analyticsData.frontendProjectStats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Difficulty Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Difficulty Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={analyticsData.frontendProjectStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ difficulty, count }) => `${difficulty}: ${count}`}
                      >
                        {analyticsData.frontendProjectStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.difficulty] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Submission Status */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.frontendSubmissionStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                        {analyticsData.frontendSubmissionStats?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'completed' ? COLORS.success : COLORS.warning} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Popular Tags */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.frontendTagStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis dataKey="tag" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Frontend Manager Component */}
            <AdminFrontendManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;