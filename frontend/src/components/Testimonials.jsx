import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rahul Kumar",
      role: "Software Engineer at Google",
      text: "Code Here helped me crack my dream job. The structured learning made a huge difference.",
    },
    {
      name: "Priya Sharma",
      role: "Frontend Developer at Microsoft",
      text: "Best platform for full-stack learning. The roadmaps & projects are industry-level.",
    },
    {
      name: "Amit Patel",
      role: "Data Engineer at Amazon",
      text: "The SQL playground is unmatched. Prepared me perfectly for technical interviews.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Success Stories</h2>
          <p className="text-lg text-gray-600">
            Join thousands of learners who landed their dream jobs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4 italic">"{test.text}"</p>
              <div className="font-semibold text-gray-900">{test.name}</div>
              <div className="text-sm text-gray-600">{test.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
