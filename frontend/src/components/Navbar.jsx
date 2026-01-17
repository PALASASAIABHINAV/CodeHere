import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Code, User, Settings, LogOut, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { user, logout } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Code className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">Code Here</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="hover:text-blue-600">Home</Link>
            <a href="#categories" className="hover:text-blue-600">Categories</a>
            <Link to="/prime" className="hover:text-blue-600">Prime</Link>
            <a href="#features" className="hover:text-blue-600">Features</a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {getInitials(user.name)}
                    </div>
                  )}
                  {user.is_prime && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.is_prime && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-semibold rounded-full">
                          <Crown className="h-3 w-3" />
                          Prime Member
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition font-semibold"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 hover:text-blue-600"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Free
                </button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/home" className="block py-2" onClick={() => setIsOpen(false)}>Home</Link>
            <a href="#categories" className="block py-2" onClick={() => setIsOpen(false)}>Categories</a>
            <Link to="/prime" className="block py-2" onClick={() => setIsOpen(false)}>Prime</Link>
            <a href="#features" className="block py-2" onClick={() => setIsOpen(false)}>Features</a>

            {user ? (
              <>
                <Link to="/profile" className="block py-2" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-blue-600 font-semibold" onClick={() => setIsOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate("/login"); setIsOpen(false); }} className="py-2 block">
                  Login
                </button>
                <button
                  onClick={() => { navigate("/signup"); setIsOpen(false); }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;