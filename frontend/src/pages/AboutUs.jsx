import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
                        <h1 className="text-4xl font-extrabold text-white mb-2">About Us</h1>
                        <p className="text-blue-100 text-lg">The story behind Code Here</p>
                    </div>

                    <div className="p-10 text-center space-y-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl animate-bounce">🚀</span>
                        </div>

                        <p className="text-xl text-gray-700 leading-relaxed font-medium">
                            "I'm only a student doing this. I'm a B.Tech 3rd year CSE student. This is a startup idea."
                        </p>

                        <div className="h-1 w-20 bg-blue-500 rounded-full mx-auto my-6 opacity-50"></div>

                        <div className="text-gray-600">
                            <p className="italic">
                                Building the future of coding education, one problem at a time.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Code Here. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;
