import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Code,
  Database,
  Layout,
  Server,
  Layers,
  Brain,
  BookOpen,
  Award,
  Lock,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    {
      icon: Code,
      name: "DSA",
      title: "Data Structures & Algorithms",
      desc: "Master arrays, trees, graphs, dynamic programming and more",
      problems: "500+ Problems",
      difficulty: "Easy to Hard",
      color: "blue",
      free: 50,
      prime: 500,
      route: "/dsa/problems",
    },
    {
      icon: Database,
      name: "SQL",
      title: "SQL & Database",
      desc: "Practice queries on real databases with hands-on challenges",
      problems: "100+ Queries",
      difficulty: "Beginner to Advanced",
      color: "green",
      free: 10,
      prime: 100,
      route: "/sql/problems",
    },
    {
      icon: Layout,
      name: "Frontend",
      title: "Frontend Development",
      desc: "HTML, CSS, JavaScript, React, Tailwind and modern frameworks",
      problems: "80+ Topics",
      difficulty: "Basic to Expert",
      color: "purple",
      free: 20,
      prime: 80,
      route: "/frontend",
    },
    {
      icon: Server,
      name: "Backend",
      title: "Backend Development",
      desc: "Node.js, Express, REST APIs, authentication and databases",
      problems: "60+ Topics",
      difficulty: "Intermediate to Advanced",
      color: "orange",
      free: 15,
      prime: 60,
      route: "/backend",
    },
    {
      icon: Layers,
      name: "Full Stack",
      title: "Full Stack Projects",
      desc: "Build complete applications from frontend to deployment",
      problems: "50+ Projects",
      difficulty: "Real-world Apps",
      color: "red",
      free: 5,
      prime: 50,
      route: "/projects",
    },
    {
      icon: Brain,
      name: "Aptitude",
      title: "Aptitude & Reasoning",
      desc: "Logical reasoning, quantitative aptitude, and problem solving",
      problems: "200+ Questions",
      difficulty: "Easy to Hard",
      color: "indigo",
      free: 40,
      prime: 200,
      route: "/aptitude",
    },
    {
      icon: BookOpen,
      name: "Interview Prep",
      title: "Interview Preparation",
      desc: "Mock interviews, HR questions, behavioral rounds and tips",
      problems: "100+ Questions",
      difficulty: "Company-wise",
      color: "pink",
      free: 20,
      prime: 100,
      route: "/interview",
    },
    {
      icon: Award,
      name: "DevOps",
      title: "DevOps & Deployment",
      desc: "Docker, Kubernetes, CI/CD, AWS, and cloud deployment",
      problems: "40+ Topics",
      difficulty: "Intermediate to Expert",
      color: "teal",
      free: 10,
      prime: 40,
      route: "/devops",
    },
  ];

  const roadmaps = [
    { name: "Complete DSA Roadmap", duration: "6 months", level: "Beginner" },
    { name: "Full Stack Developer", duration: "8 months", level: "Intermediate" },
    { name: "FAANG Interview Prep", duration: "4 months", level: "Advanced" },
  ];

  const handleCategoryClick = (route) => {
    if (route) {
      navigate(route);
    } else {
      alert("This section is coming soon!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore structured roadmaps and start practicing today
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryClick(cat.route)}
                className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <cat.icon className="h-12 w-12 text-blue-600" />
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-gray-500">{cat.problems}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{cat.desc}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    Difficulty: {cat.difficulty}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Free Access:</span>
                    <span className="font-semibold text-gray-900">
                      {cat.free} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Lock className="h-4 w-4 mr-1 text-blue-600" />
                      Prime Access:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {cat.prime} items
                    </span>
                  </div>
                </div>

                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(cat.route);
                  }}
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmaps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Structured Learning Roadmaps
            </h2>
            <p className="text-lg text-gray-600">
              Follow our expert-curated paths to reach your goals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roadmaps.map((roadmap, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {roadmap.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{roadmap.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold">{roadmap.level}</span>
                  </div>
                </div>
                <button className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800">
                  View Roadmap
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want Full Access to Everything?
          </h2>
          <p className="text-xl mb-8">
            Upgrade to Prime and unlock all problems, projects, and features
          </p>
          <button
            onClick={() => navigate("/prime")}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100"
          >
            Explore Prime Membership
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;