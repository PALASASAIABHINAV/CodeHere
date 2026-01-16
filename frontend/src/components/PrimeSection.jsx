import React from "react";
import { useNavigate } from "react-router-dom";

const PrimeSection = () => {
  const navigate = useNavigate();

  return (
    <section id="prime" className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Unlock Your Full Potential with Prime
        </h2>

        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Get unlimited access to problems, projects, AI help, mock interviews & more.
        </p>

        <ul className="max-w-2xl mx-auto text-left mb-10 space-y-3">
          <li>✓ Unlimited DSA & SQL problems</li>
          <li>✓ Full-stack project guidance</li>
          <li>✓ Unlimited AI assistant queries</li>
          <li>✓ Mock interviews & analytics</li>
          <li>✓ Certificates & priority support</li>
        </ul>

        <button
          onClick={() => navigate("/prime")}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100"
        >
          View Prime Plans
        </button>
      </div>
    </section>
  );
};

export default PrimeSection;