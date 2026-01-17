// pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Save, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    github_url: '',
    linkedin_url: '',
    skills: [],
    education: [],
    experience: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newExperience, setNewExperience] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          name: data.profile.name || '',
          bio: data.profile.bio || '',
          location: data.profile.location || '',
          website: data.profile.website || '',
          github_url: data.profile.github_url || '',
          linkedin_url: data.profile.linkedin_url || '',
          skills: data.profile.skills || [],
          education: data.profile.education || [],
          experience: data.profile.experience || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        await loadUser();
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (error) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/password', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || 'Password update failed');
      }
    } catch (error) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    if (newEducation.trim()) {
      setProfileData({
        ...profileData,
        education: [...profileData.education, newEducation.trim()],
      });
      setNewEducation('');
    }
  };

  const removeEducation = (index) => {
    setProfileData({
      ...profileData,
      education: profileData.education.filter((_, i) => i !== index),
    });
  };

  const addExperience = () => {
    if (newExperience.trim()) {
      setProfileData({
        ...profileData,
        experience: [...profileData.experience, newExperience.trim()],
      });
      setNewExperience('');
    }
  };

  const removeExperience = (index) => {
    setProfileData({
      ...profileData,
      experience: profileData.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'password'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock className="inline h-4 w-4 mr-2" />
                Password
              </button>
            </nav>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={profileData.github_url}
                  onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={profileData.linkedin_url}
                  onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="h-5 w-5" />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Settings;