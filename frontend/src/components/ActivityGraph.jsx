import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const ActivityGraph = ({ data }) => {
    // If no data, provide dummy data to show empty state structure or just empty array
    const chartData = data && data.length > 0 ? data : [];

    // Format date for X-axis
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 flex flex-col items-center justify-center h-full min-h-[300px]">
                <h2 className="text-lg font-bold text-gray-700 mb-4 self-start">Submission Activity</h2>
                <p className="text-gray-400">No submission activity yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 h-full">
            <h2 className="text-lg font-bold text-gray-700 mb-6">Submission Activity</h2>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelFormatter={formatDate}
                        />
                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            height={36}
                        />
                        <Area
                            type="monotone"
                            dataKey="accepted"
                            name="Accepted"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="url(#colorAccepted)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="failed"
                            name="Failed"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorFailed)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityGraph;
