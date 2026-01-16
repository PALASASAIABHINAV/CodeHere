import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Star, Zap, Shield, TrendingUp, Users } from "lucide-react";

const Prime = () => {
  const primeFeatures = [
    {
      icon: Check,
      title: "Unlimited DSA Problems",
      desc: "Access 500+ problems with detailed editorial solutions and video explanations",
    },
    {
      icon: Zap,
      title: "SQL Playground Access",
      desc: "Practice on real databases with 100+ SQL challenges and query optimization",
    },
    {
      icon: Star,
      title: "Full Stack Projects",
      desc: "50+ guided projects with complete source code and deployment guides",
    },
    {
      icon: Shield,
      title: "Unlimited AI Assistant",
      desc: "Get instant help, code reviews, and debugging support 24/7",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      desc: "Track your progress with detailed insights, heatmaps, and performance reports",
    },
    {
      icon: Users,
      title: "Mock Interviews",
      desc: "Practice with real interview questions and get feedback from experts",
    },
  ];

  const plans = [
    {
      name: "Monthly",
      price: "₹499",
      duration: "/month",
      features: [
        "All Prime features",
        "Cancel anytime",
        "Instant access",
        "Priority support",
      ],
      popular: false,
    },
    {
      name: "Yearly",
      price: "₹3,999",
      duration: "/year",
      savings: "Save ₹2,000",
      features: [
        "All Prime features",
        "2 months free",
        "Certificate access",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Lifetime",
      price: "₹9,999",
      duration: "one-time",
      savings: "Best Value",
      features: [
        "All Prime features",
        "Lifetime access",
        "All future updates",
        "VIP support",
      ],
      popular: false,
    },
  ];

  const comparisons = [
    { feature: "DSA Problems", free: "50 problems", prime: "500+ problems" },
    { feature: "SQL Challenges", free: "10 queries", prime: "100+ queries" },
    { feature: "Projects", free: "View only", prime: "Full access + code" },
    { feature: "AI Assistant", free: "5 queries/day", prime: "Unlimited" },
    { feature: "Mock Interviews", free: "❌", prime: "✓ Unlimited" },
    { feature: "Analytics Dashboard", free: "Basic", prime: "Advanced" },
    { feature: "Certificates", free: "❌", prime: "✓ All topics" },
    { feature: "Priority Support", free: "❌", prime: "✓ 24/7" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-blue-500 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            🚀 PRIME MEMBERSHIP
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get unlimited access to everything you need to become a successful software engineer
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100">
            Start Prime Today
          </button>
        </div>
      </section>

      {/* Prime Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You Get with Prime
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to master software engineering
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {primeFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Select the plan that works best for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg p-8 ${
                  plan.popular
                    ? "border-4 border-blue-600 shadow-xl transform scale-105"
                    : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.duration}</span>
                  {plan.savings && (
                    <div className="text-green-600 font-semibold mt-1">
                      {plan.savings}
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Free vs Prime
            </h2>
            <p className="text-lg text-gray-600">
              See what you unlock with Prime membership
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">
                    Prime
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.free}
                    </td>
                    <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                      {item.prime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of students who are already learning with Prime
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100">
            Get Prime Now
          </button>
          <p className="mt-4 text-sm">30-day money-back guarantee</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Prime;