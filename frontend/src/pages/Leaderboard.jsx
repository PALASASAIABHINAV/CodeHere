import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trophy, Medal, Crown, User, TrendingUp, Award } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [currentUserStats, setCurrentUserStats] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserRankAndStats();
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/leaderboard', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRankAndStats = async () => {
        try {
            // Fetch Rank
            const rankRes = await fetch(`http://localhost:5000/api/leaderboard/rank/${user.id}`, { credentials: 'include' });
            const rankData = await rankRes.json();
            if (rankData.success) {
                setCurrentUserRank(rankData.data.rank);
            }

            // Fetch Profile Stats for breakdown
            const profileRes = await fetch(`http://localhost:5000/api/profile/${user.id}`, { credentials: 'include' });
            const profileData = await profileRes.json();
            if (profileData.success) {
                setCurrentUserStats(profileData.profile);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return { icon: <Medal className="h-8 w-8 text-yellow-500" />, bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100', border: 'border-yellow-300' };
        if (rank === 2) return { icon: <Medal className="h-8 w-8 text-gray-400" />, bg: 'bg-gradient-to-r from-gray-50 to-gray-100', border: 'border-gray-300' };
        if (rank === 3) return { icon: <Medal className="h-8 w-8 text-orange-700" />, bg: 'bg-gradient-to-r from-orange-50 to-orange-100', border: 'border-orange-300' };
        if (rank <= 10) return { icon: <Award className="h-6 w-6 text-purple-600" />, bg: 'bg-white', border: 'border-gray-200' };
        return { icon: <span className="text-gray-600 font-bold text-lg">#{rank}</span>, bg: 'bg-white', border: 'border-gray-200' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
            <Navbar />

            <div className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="h-12 w-12 text-yellow-500" />
                        <h1 className="text-4xl font-bold text-gray-900">Global Leaderboard</h1>
                    </div>
                    <p className="text-gray-600 text-lg">Top 100 Problem Solvers</p>
                </div>

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg">No users found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-20">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Total Solved</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Easy</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Medium</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Hard</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Acceptance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaderboard.map((user) => {
                                        const badge = getRankBadge(user.rank);
                                        const isCurrentUser = currentUserStats && user.id === currentUserStats.id;
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`${isCurrentUser ? 'bg-blue-50' : badge.bg} hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${badge.border}`}
                                                onClick={() => navigate(`/profile/${user.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center w-12">
                                                        {badge.icon}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.profile_picture_url ? (
                                                            <img src={user.profile_picture_url} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                                                <User className="h-6 w-6 text-white" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>{user.name} {isCurrentUser && '(You)'}</span>
                                                                {user.is_prime && (
                                                                    <Crown className="h-4 w-4 text-yellow-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">
                                                        <TrendingUp className="h-5 w-5" />
                                                        {user.problems_solved}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">{user.easy_solved}</span></td>
                                                <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">{user.medium_solved}</span></td>
                                                <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg font-semibold text-sm">{user.hard_solved}</span></td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm">
                                                        <span className="font-bold text-gray-900">{user.acceptance_rate}%</span>
                                                        <div className="text-xs text-gray-500 mt-1">{user.accepted_submissions}/{user.total_submissions}</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky User Rank Footer */}
            {user && currentUserStats && !loading && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 transform transition-transform duration-300">
                    <div className="max-w-7xl mx-auto px-4">
                        <table className="w-full">
                            <tbody>
                                <tr
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                    <td className="px-6 py-4 w-[100px]">
                                        <div className="flex items-center justify-center flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Your Rank</span>
                                            <span className="text-xl font-black text-blue-600">#{currentUserRank}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {currentUserStats.profile_picture_url ? (
                                                <img src={currentUserStats.profile_picture_url} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" />
                                            ) : (
                                                <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{user.name}</span>
                                                    {user.is_prime && <Crown className="h-4 w-4 text-yellow-500" />}
                                                </div>
                                                <span className="text-xs text-blue-600 font-medium">View Profile</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <div className="text-sm font-bold text-gray-900">{currentUserStats.solved_count} <span className="text-xs text-gray-500 font-normal">Solved</span></div>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">{currentUserStats.solved_by_difficulty?.Easy || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">{currentUserStats.solved_by_difficulty?.Medium || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">{currentUserStats.solved_by_difficulty?.Hard || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Acceptance Rate might need calc from profile stats if available, or just omit for sticky footer to save space */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Leaderboard;
