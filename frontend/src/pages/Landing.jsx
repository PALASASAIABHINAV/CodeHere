import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Features from "../components/Features";
import PrimeSection from "../components/PrimeSection";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Categories />
      <Features />
      <PrimeSection />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Landing;
