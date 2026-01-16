import React, { useState } from "react";
import { Menu, X, Code } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use Zustand store instead of localStorage
  const { user, logout } = useAuthStore();

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
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

            {!user ? (
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
            ) : (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;