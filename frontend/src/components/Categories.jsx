import React from "react";
import {
  Code,
  Database,
  Layout,
  Server,
  Layers,
  Brain,
  BookOpen,
  Award,
} from "lucide-react";

const Categories = () => {
  const categories = [
    { icon: Code, name: "DSA", desc: "Master data structures & algorithms", color: "blue" },
    { icon: Database, name: "SQL", desc: "Practice on real databases", color: "green" },
    { icon: Layout, name: "Frontend", desc: "HTML, CSS, React & more", color: "purple" },
    { icon: Server, name: "Backend", desc: "Node.js, Express, APIs", color: "orange" },
    { icon: Layers, name: "Full Stack", desc: "End-to-end development", color: "red" },
    { icon: Brain, name: "Aptitude", desc: "Logical reasoning & math", color: "indigo" },
    { icon: BookOpen, name: "Interview Prep", desc: "Mock interviews & tips", color: "pink" },
    { icon: Award, name: "Projects", desc: "Build real-world apps", color: "teal" },
  ];

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Everything You Need</h2>
          <p className="text-lg text-gray-600">
            Explore our comprehensive learning paths
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <cat.icon className={`h-10 w-10 text-${cat.color}-600 mb-4`} />
              <h3 className="text-xl font-semibold">{cat.name}</h3>
              <p className="text-gray-600">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
