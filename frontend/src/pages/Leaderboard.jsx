import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trophy, Medal, Crown, User, Award, Star, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [category, setCategory] = useState('global');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [userRankings, setUserRankings] = useState(null);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchLeaderboard();
    }, [category]);

    useEffect(() => {
        if (user) {
            fetchUserRankings();
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/leaderboard?category=${category}`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setLeaderboard(data.leaderboard);
                setCurrentPage(1); // Reset to page 1 on category change
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRankings = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/leaderboard/user/${user.id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            console.log('User rankings API response:', data);
            if (data.success) {
                setUserRankings(data.data);
                console.log('User rankings data set:', data.data);
            } else {
                console.error('User rankings API failed:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user rankings:', error);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return { icon: <Medal className="h-8 w-8 text-yellow-500" />, bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100', border: 'border-yellow-400', glow: true };
        if (rank === 2) return { icon: <Medal className="h-8 w-8 text-gray-400" />, bg: 'bg-gradient-to-r from-gray-50 to-gray-100', border: 'border-gray-400', glow: true };
        if (rank === 3) return { icon: <Medal className="h-8 w-8 text-orange-600" />, bg: 'bg-gradient-to-r from-orange-50 to-orange-100', border: 'border-orange-400', glow: true };
        if (rank <= 10) return { icon: <Award className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-200', glow: false };
        return { icon: <span className="text-gray-600 font-bold text-lg">#{rank}</span>, bg: 'bg-white', border: 'border-gray-200', glow: false };
    };

    const getCategoryHeader = () => {
        switch (category) {
            case 'dsa':
                return { title: 'DSA Leaderboard', subtitle: 'Top 100 Problem Solvers', pointsLabel: 'DSA Points' };
            case 'frontend':
                return { title: 'Frontend Leaderboard', subtitle: 'Top 100 Project Creators', pointsLabel: 'Frontend Points' };
            case 'global':
            default:
                return { title: 'Global Leaderboard', subtitle: 'Top 100 Overall', pointsLabel: 'Total Points' };
        }
    };

    const getCurrentRank = () => {
        if (!userRankings) return null;
        switch (category) {
            case 'dsa':
                return { rank: userRankings.dsa_rank, points: userRankings.dsa_points };
            case 'frontend':
                return { rank: userRankings.frontend_rank, points: userRankings.frontend_points };
            case 'global':
            default:
                return { rank: userRankings.global_rank, points: userRankings.total_points };
        }
    };

    const header = getCategoryHeader();
    const currentRank = getCurrentRank();

    // Pagination
    const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLeaderboard = leaderboard.slice(startIndex, endIndex);

    const isCurrentUser = (leaderboardUser) => user && leaderboardUser.id === user.id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
            <Navbar />

            <div className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full" style={{ paddingBottom: (user && userRankings && currentRank) ? '100px' : '0' }}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="h-12 w-12 text-yellow-500" />
                        <h1 className="text-4xl font-bold text-gray-900">{header.title}</h1>
                    </div>
                    <p className="text-gray-600 text-lg">{header.subtitle}</p>
                </div>

                {/* Category Selector */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center px-2">Category:</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium cursor-pointer"
                        >
                            <option value="global">Global</option>
                            <option value="dsa">DSA</option>
                            <option value="frontend">Frontend</option>
                        </select>
                    </div>
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
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">{header.pointsLabel}</th>
                                            {category === 'dsa' && (
                                                <>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Problems</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Easy</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Medium</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Hard</th>
                                                </>
                                            )}
                                            {category === 'frontend' && (
                                                <>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Projects</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Easy</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Medium</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Hard</th>
                                                </>
                                            )}
                                            {category === 'global' && (
                                                <>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">DSA Points</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Frontend Points</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Problems</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Projects</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentLeaderboard.map((leaderUser) => {
                                            const badge = getRankBadge(leaderUser.rank);
                                            const isCurrent = isCurrentUser(leaderUser);
                                            return (
                                                <tr
                                                    key={leaderUser.id}
                                                    className={`${isCurrent ? 'bg-blue-50 border-l-4 border-l-blue-600' : badge.bg} hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${badge.border} ${badge.glow ? 'shadow-sm' : ''}`}
                                                    onClick={() => navigate(`/profile/${leaderUser.id}`)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center w-12">
                                                            {badge.icon}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {leaderUser.profile_picture_url ? (
                                                                <img src={leaderUser.profile_picture_url} alt={leaderUser.name} className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                                                    <User className="h-6 w-6 text-white" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-semibold ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                                                                        {leaderUser.name} {isCurrent && <span className="text-blue-600 font-bold">(You)</span>}
                                                                    </span>
                                                                    {leaderUser.is_prime && (<Crown className="h-4 w-4 text-yellow-500" />)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 rounded-full font-bold text-lg">
                                                            <Star className="h-5 w-5" />
                                                            {category === 'dsa' && leaderUser.dsa_points}
                                                            {category === 'frontend' && leaderUser.frontend_points}
                                                            {category === 'global' && leaderUser.total_points}
                                                        </div>
                                                    </td>
                                                    {category === 'dsa' && (
                                                        <>
                                                            <td className="px-6 py-4 text-center"><span className="font-semibold text-gray-900">{leaderUser.problems_solved}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">{leaderUser.easy_solved}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">{leaderUser.medium_solved}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg font-semibold text-sm">{leaderUser.hard_solved}</span></td>
                                                        </>
                                                    )}
                                                    {category === 'frontend' && (
                                                        <>
                                                            <td className="px-6 py-4 text-center"><span className="font-semibold text-gray-900">{leaderUser.projects_completed}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">{leaderUser.easy_completed}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">{leaderUser.medium_completed}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg font-semibold text-sm">{leaderUser.hard_completed}</span></td>
                                                        </>
                                                    )}
                                                    {category === 'global' && (
                                                        <>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm">{leaderUser.dsa_points}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="px-3 py-1.5 bg-pink-100 text-pink-800 rounded-lg font-semibold text-sm">{leaderUser.frontend_points}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="font-semibold text-gray-700">{leaderUser.problems_solved}</span></td>
                                                            <td className="px-6 py-4 text-center"><span className="font-semibold text-gray-700">{leaderUser.projects_completed}</span></td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-700 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sticky User Rank Footer (Only for logged-in users) */}
            {user && currentRank && !loading && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Your Rank in {category.toUpperCase()}</span>
                                    <span className="text-2xl font-black text-blue-600">#{currentRank.rank}</span>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div className="text-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Your Points</span>
                                    <span className="text-2xl font-black text-purple-600">{currentRank.points}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/profile/${user.id}`)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                View Full Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Leaderboard;
