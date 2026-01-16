import React from "react";
import { Code } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <Code className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">Code Here</span>
            </Link>
            <p className="text-sm">Your complete platform for engineering success.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Learning</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="hover:text-white">DSA</Link></li>
              <li><Link to="/home" className="hover:text-white">SQL</Link></li>
              <li><Link to="/home" className="hover:text-white">Full Stack</Link></li>
              <li><Link to="/home" className="hover:text-white">Interview Prep</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><Link to="/prime" className="hover:text-white">Prime</Link></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          © 2025 Code Here. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;