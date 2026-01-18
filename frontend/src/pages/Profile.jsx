// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
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
  Share2,
  Camera,
  X,
  Code
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ActivityHeatmap from '../components/ActivityHeatmap';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, profilePictureRequired, updateProfilePicture } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;

  useEffect(() => {
    fetchProfile();
    fetchHeatmap();
  }, [userId, currentUser]);

  useEffect(() => {
    if (profile?.id) {
      fetchRank();
    }
  }, [profile]);

  useEffect(() => {
    if (isOwnProfile && profilePictureRequired) {
      setShowUploadModal(true);
    }
  }, [isOwnProfile, profilePictureRequired]);

  const fetchProfile = async () => {
    try {
      const url = userId
        ? `http://localhost:5000/api/profile/${userId}`
        : 'http://localhost:5000/api/profile';

      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
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
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setHeatmap(data.heatmap);
      }
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  const fetchRank = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaderboard/rank/${profile.id}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setRankData(data.data);
      }
    } catch (error) {
      console.error('Error fetching rank:', error);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/profile/${profile.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Profile link copied to clipboard!');
  };

  const handleProfilePictureUpdate = (newUrl) => {
    setProfile({ ...profile, profile_picture_url: newUrl });
    updateProfilePicture(newUrl);
    setShowUploadModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <button onClick={() => navigate('/home')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {isOwnProfile && (
                  <button onClick={() => setShowUploadModal(!showUploadModal)} className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.is_prime && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-sm font-semibold rounded-full">
                      <Crown className="h-4 w-4" /> Prime
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                  {profile.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{profile.email}</span></div>}
                  {profile.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{profile.location}</span></div>}
                </div>
                {profile.bio && <p className="mt-3 text-gray-700">{profile.bio}</p>}

                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <LinkIcon className="h-4 w-4" /> Website
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-700 hover:text-black">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile && (
                <button onClick={() => navigate('/settings')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit className="h-4 w-4" /> Edit Profile
                </button>
              )}
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-600">Global Rank</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {rankData ? `#${rankData.rank}` : '-'}
            </p>
            {/* Removed Percentile as requested */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Trophy className="h-24 w-24 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Code className="h-6 w-6 text-green-600" />
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
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Problems Solved by Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Easy', 'Medium', 'Hard'].map((difficulty) => (
              <div key={difficulty}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">{difficulty}</span>
                  <span className={`text-sm font-bold ${difficulty === 'Easy' ? 'text-green-600' :
                    difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {profile.solved_by_difficulty?.[difficulty] || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${difficulty === 'Easy' ? 'bg-green-600' :
                      difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                    style={{ width: `${Math.min((profile.solved_by_difficulty?.[difficulty] || 0) / 50 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ActivityHeatmap heatmapData={heatmap} />

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Upload Profile Picture</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ProfilePictureUpload
                currentPicture={profile.profile_picture_url}
                onUploadSuccess={handleProfilePictureUpdate}
                canDelete={!profile.is_prime}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;