// CircularProgress component for problems solved visualization
import React from 'react';

const CircularProgress = ({
    solved,
    total,
    easy,
    medium,
    hard,
    attempted,
    totalEasy,
    totalMedium,
    totalHard,
    label = "Solved" // Default to "Solved"
}) => {
    const percentage = total > 0 ? (solved / total) * 100 : 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    // ... calculations ...
    const offset = circumference - (percentage / 100) * circumference;

    // Calculate percentages for each difficulty (relative to TOTAL, for the ring segments)
    const easySegment = total > 0 ? (easy / total) * 100 : 0;
    const mediumSegment = total > 0 ? (medium / total) * 100 : 0;
    const hardSegment = total > 0 ? (hard / total) * 100 : 0;

    return (
        <div className="flex items-center justify-between p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-md mx-auto">
            {/* Circular Chart */}
            <div className="relative flex items-center justify-center">
                <svg width="200" height="200" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                    />

                    {/* Easy progress (green) */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#22c55e"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (easySegment / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />

                    {/* Medium progress (yellow) - starts after easy */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#eab308"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - ((easySegment + mediumSegment) / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />

                    {/* Hard progress (red) - starts after easy + medium */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#ef4444"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute text-center">
                    <div className="text-4xl font-black text-gray-900">{solved}</div>
                    <div className="text-sm text-gray-500 font-medium">/{total}</div>
                    <div className="text-xs text-gray-600 font-semibold mt-1">{label}</div>
                    {attempted > 0 && (
                        <div className="text-xs text-blue-600 font-medium mt-2">{attempted} Attempting</div>
                    )}
                </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="flex flex-col gap-3 ml-8 w-full">
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3 rounded-lg border border-green-200 flex justify-between items-center">
                    <div className="text-sm font-semibold text-green-700">Easy</div>
                    <div className="text-2xl font-black text-green-900">{easy}<span className="text-sm text-green-600 font-normal">/{totalEasy || 0}</span></div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-3 rounded-lg border border-yellow-200 flex justify-between items-center">
                    <div className="text-sm font-semibold text-yellow-700">Med.</div>
                    <div className="text-2xl font-black text-yellow-900">{medium}<span className="text-sm text-yellow-600 font-normal">/{totalMedium || 0}</span></div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-3 rounded-lg border border-red-200 flex justify-between items-center">
                    <div className="text-sm font-semibold text-red-700">Hard</div>
                    <div className="text-2xl font-black text-red-900">{hard}<span className="text-sm text-red-600 font-normal">/{totalHard || 0}</span></div>
                </div>
            </div>
        </div>
    );
};

export default CircularProgress;
