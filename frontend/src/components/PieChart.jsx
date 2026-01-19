// PieChart component for submission outcomes
import React from 'react';

const PieChart = ({ accepted, total }) => {
    const acceptedPercentage = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const wrongPercentage = 100 - acceptedPercentage;

    // Calculate pie chart segments
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    // Green segment (accepted)
    const acceptedDash = (acceptedPercentage / 100) * circumference;
    const acceptedGap = circumference - acceptedDash;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-6">Submission Outcomes</h2>

            <div className="flex items-center justify-center gap-12">
                {/* Pie Chart SVG */}
                <div className="relative">
                    <svg width="200" height="200" className="transform -rotate-90">
                        {/* Background circle (gray) */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="40"
                        />

                        {/* Accepted segment (green) */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="40"
                            strokeDasharray={`${acceptedDash} ${acceptedGap}`}
                            strokeDashoffset="0"
                            className="transition-all duration-500"
                        />

                        {/* Wrong Answer segment (red) - starts after green */}
                        {wrongPercentage > 0 && (
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="40"
                                strokeDasharray={`${(wrongPercentage / 100) * circumference} ${circumference}`}
                                strokeDashoffset={-acceptedDash}
                                className="transition-all duration-500"
                            />
                        )}
                    </svg>

                    {/* Center percentage */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-black text-gray-900">{acceptedPercentage}%</div>
                            <div className="text-xs text-gray-500 font-medium">Accepted</div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                        <div>
                            <div className="text-sm font-semibold text-emerald-600">Accepted</div>
                            <div className="text-2xl font-black text-gray-900">{acceptedPercentage}%</div>
                            <div className="text-xs text-gray-500">{accepted} submissions</div>
                        </div>
                    </div>

                    {wrongPercentage > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <div>
                                <div className="text-sm font-semibold text-red-600">Wrong Answer</div>
                                <div className="text-2xl font-black text-gray-900">{wrongPercentage}%</div>
                                <div className="text-xs text-gray-500">{total - accepted} submissions</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PieChart;
