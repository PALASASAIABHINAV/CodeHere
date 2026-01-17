// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Users,
  FileCode,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AdminProblemManager from '../components/AdminProblemManager';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchUsers();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrime = async (userId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/prime`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrime: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error toggling prime:', error);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmed = window.confirm(
      `Are you sure you want to ${newRole === 'admin' ? 'grant' : 'revoke'} admin access?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, problems, and platform statistics</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'stats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="inline h-5 w-5 mr-2" />
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="inline h-5 w-5 mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'problems'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileCode className="inline h-5 w-5 mr-2" />
                Problems
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-blue-600" />
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8 text-yellow-600" />
                <h3 className="text-sm font-medium text-gray-600">Prime Users</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.prime_users}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileCode className="h-8 w-8 text-green-600" />
                <h3 className="text-sm font-medium text-gray-600">Total Problems</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_problems}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <h3 className="text-sm font-medium text-gray-600">Total Submissions</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_submissions}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceptance Rate</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{
                    width: `${(stats.accepted_submissions / stats.total_submissions * 100).toFixed(1)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {stats.accepted_submissions} / {stats.total_submissions} submissions accepted (
                {((stats.accepted_submissions / stats.total_submissions) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Solved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{u.solved_count || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_prime ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            <Crown className="h-3 w-3" />
                            Prime
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePrime(u.id, u.is_prime)}
                            className={`px-3 py-1 text-xs rounded ${
                              u.is_prime
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            {u.is_prime ? 'Revoke Prime' : 'Grant Prime'}
                          </button>
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className={`px-3 py-1 text-xs rounded ${
                              u.role === 'admin'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            <Shield className="inline h-3 w-3 mr-1" />
                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                          >
                            <Trash2 className="inline h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === 'problems' && (
  <AdminProblemManager />
)}

      </div>
    </div>
  );
};

export default AdminDashboard;