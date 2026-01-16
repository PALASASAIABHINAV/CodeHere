import React from "react";

const Features = () => {
  const features = [
    { title: "Structured Roadmaps", desc: "Clear paths from beginner to expert" },
    { title: "Hands-on Practice", desc: "Write and run code instantly" },
    { title: "Real SQL Database", desc: "Practice on real data tables" },
    { title: "AI Assistant", desc: "Get instant help when stuck" },
    { title: "Progress Tracking", desc: "Monitor your learning analytics" },
    { title: "Interview Ready", desc: "Mock interviews & tips" },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose Code Here?</h2>
          <p className="text-lg text-gray-600">
            Built for students, by engineering experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
