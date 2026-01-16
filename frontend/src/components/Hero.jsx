import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20" id="home">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Software Engineering
            <span className="block text-blue-600 mt-2">All in One Place</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop switching between platforms. Learn DSA, SQL, Full Stack
            Development, and interview skills—everything in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
            >
              Start Learning Free
            </button>
            <button
              onClick={() => navigate("/prime")}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg text-lg hover:bg-blue-50"
            >
              Explore Prime
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm">DSA Problems</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100+</div>
              <div className="text-sm">SQL Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm">Projects</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;