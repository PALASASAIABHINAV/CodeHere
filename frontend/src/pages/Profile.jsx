// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Crown,
  Trophy,
  TrendingUp,
  Calendar,
  Edit,
  Share2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ActivityHeatmap from '../components/ActivityHeatmap';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;

  useEffect(() => {
    fetchProfile();
    fetchHeatmap();
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      // If no userId param, fetch own profile
      const url = userId
        ? `http://localhost:5000/api/profile/${userId}`
        : 'http://localhost:5000/api/profile';

      const response = await fetch(url, {
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        console.error('Profile fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const url = userId
        ? `http://localhost:5000/api/profile/${userId}/heatmap`
        : 'http://localhost:5000/api/profile/heatmap';

      const response = await fetch(url, {
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setHeatmap(data.heatmap);
      }
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 2) return 'bg-green-900';
    if (count <= 5) return 'bg-green-700';
    if (count <= 10) return 'bg-green-500';
    return 'bg-green-400';
  };

  const generateHeatmapGrid = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const days = [];
    const current = new Date(oneYearAgo);

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const submissionData = heatmap.find((h) => h.date.split('T')[0] === dateStr);
      days.push({
        date: dateStr,
        count: submissionData ? submissionData.count : 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/profile/${profile.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
            <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const heatmapDays = generateHeatmapGrid();
  const totalSubmissions = heatmap.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.is_prime && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-sm font-semibold rounded-full">
                      <Crown className="h-4 w-4" />
                      Prime
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-3 text-gray-700">{profile.bio}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-700 hover:text-black"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-green-600" />
              <h3 className="text-sm font-medium text-gray-600">Solved</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile.solved_count || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-600">Attempted</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile.attempted_count || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-orange-600" />
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile.current_streak || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Max Streak</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{profile.max_streak || 0}</p>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Problems Solved by Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Easy</span>
                <span className="text-sm font-bold text-green-600">
                  {profile.solved_by_difficulty?.Easy || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((profile.solved_by_difficulty?.Easy || 0) / 50 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Medium</span>
                <span className="text-sm font-bold text-yellow-600">
                  {profile.solved_by_difficulty?.Medium || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${Math.min((profile.solved_by_difficulty?.Medium || 0) / 50 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Hard</span>
                <span className="text-sm font-bold text-red-600">
                  {profile.solved_by_difficulty?.Hard || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min((profile.solved_by_difficulty?.Hard || 0) / 50 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <ActivityHeatmap heatmapData={heatmap} />
      </div>

      <Footer />
    </div>
  );
};

export default Profile;