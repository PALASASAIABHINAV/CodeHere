// Base API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic helper function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include", // include JWT cookie
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  signup: async (name, email, password) => {
    return apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiCall("/auth/logout", {
      method: "POST",
    });
  },

  getMe: async () => {
    return apiCall("/auth/me", {
      method: "GET",
    });
  },
};

export default authAPI;
