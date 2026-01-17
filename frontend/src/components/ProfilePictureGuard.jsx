import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle, Upload, Crown, LogOut } from 'lucide-react';

const ProfilePictureGuard = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profilePictureRequired, clearUser } = useAuthStore();

    useEffect(() => {
        if (profilePictureRequired && location.pathname !== '/profile') {
            navigate('/profile', { replace: true });
        }
    }, [profilePictureRequired, location.pathname, navigate]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            clearUser();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (profilePictureRequired && location.pathname !== '/profile') {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-yellow-900" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Profile Picture Required
                    </h2>

                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="font-medium text-yellow-900 mb-1">Prime Member Security</p>
                                <p className="text-sm text-yellow-800">
                                    As a <strong>Prime member</strong>, you must upload your profile picture before accessing platform features. This ensures account security and enables future face recognition authentication.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium mb-3"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Profile Picture Now
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                        You'll get full access once your photo is uploaded
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProfilePictureGuard;
