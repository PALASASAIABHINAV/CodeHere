import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            profilePictureRequired: false,

            setUser: (user) => {
                const needsProfilePicture = user?.is_prime && !user?.profile_picture_url;
                set({
                    user,
                    profilePictureRequired: needsProfilePicture
                });
            },

            login: async (email, password) => {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (data.success) {
                    const needsProfilePicture = data.user.is_prime && !data.user.profile_picture_url;
                    set({
                        user: data.user,
                        profilePictureRequired: needsProfilePicture
                    });
                    return data;
                } else {
                    // Throw error so Login page can catch it
                    throw new Error(data.message || 'Invalid email or password');
                }
            },

            register: async (name, email, password) => {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();

                if (data.success) {
                    const needsProfilePicture = data.user.is_prime && !data.user.profile_picture_url;
                    set({
                        user: data.user,
                        profilePictureRequired: needsProfilePicture
                    });
                    return data;
                } else {
                    // Throw error so SignUp page can catch it
                    throw new Error(data.message || 'Registration failed');
                }
            },

            // Alias for register (used by SignUp page)
            signup: async (name, email, password) => {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();

                if (data.success) {
                    const needsProfilePicture = data.user.is_prime && !data.user.profile_picture_url;
                    set({
                        user: data.user,
                        profilePictureRequired: needsProfilePicture
                    });
                    return data;
                } else {
                    // Throw error so SignUp page can catch it
                    throw new Error(data.message || 'Registration failed');
                }
            },

            loadUser: async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success && data.user) {
                        const needsProfilePicture = data.user.is_prime && !data.user.profile_picture_url;
                        set({
                            user: data.user,
                            profilePictureRequired: needsProfilePicture
                        });
                    } else {
                        set({ user: null, profilePictureRequired: false });
                    }
                } catch (error) {
                    console.error('Load user error:', error);
                    set({ user: null, profilePictureRequired: false });
                }
            },

            logout: async () => {
                try {
                    await fetch('http://localhost:5000/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    set({ user: null, profilePictureRequired: false });
                } catch (error) {
                    console.error('Logout error:', error);
                }
            },

            updateProfilePicture: (url) => set((state) => ({
                user: { ...state.user, profile_picture_url: url },
                profilePictureRequired: false
            })),

            clearUser: () => set({ user: null, profilePictureRequired: false }),
        }),
        {
            name: 'auth-storage', // LocalStorage key name
            partialize: (state) => ({
                user: state.user,
                profilePictureRequired: state.user?.is_prime && !state.user?.profile_picture_url
            })
        }
    )
);
