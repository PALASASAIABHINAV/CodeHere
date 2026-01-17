// components/ActivityHeatmap.jsx
import React, { useState, useMemo } from "react";

const ActivityHeatmap = ({ heatmapData = [] }) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Filter by selected year
  const yearData = useMemo(() => {
    return heatmapData.filter((h) => h.date.startsWith(String(selectedYear)));
  }, [heatmapData, selectedYear]);

  // Build all days for GitHub-style layout
  const days = useMemo(() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);

    // Offset so first column starts on Monday
    const weekday = start.getDay(); // Sun = 0
    const offset = weekday === 0 ? 6 : weekday - 1;
    start.setDate(start.getDate() - offset);

    const result = [];
    let current = new Date(start);

    // Extend grid until it completes the final week
    while (current <= end || current.getDay() !== 1) {
      const iso = current.toISOString().split("T")[0];
      const found = yearData.find((h) => h.date.startsWith(iso));

      result.push({
        date: new Date(current),
        count: found ? found.count : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [selectedYear, yearData]);

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Month labels (fixed)
  const monthLabels = {};
  weeks.forEach((week, index) => {
    const firstDay = week[0];
    const month = firstDay.date.getMonth();

    if (
      index === 0 ||
      month !== weeks[index - 1][0].date.getMonth()
    ) {
      monthLabels[index] = firstDay.date.toLocaleString("default", {
        month: "short",
      });
    }
  });

  // Colors exactly like GitHub
  const getColor = (count) => {
    if (count === 0) return "bg-[#ebedf0]";
    if (count <= 2) return "bg-[#9be9a8]";
    if (count <= 4) return "bg-[#40c463]";
    if (count <= 7) return "bg-[#30a14e]";
    return "bg-[#216e39]";
  };

  const totalSubmissions = yearData.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="bg-white rounded-lg border p-6 mt-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {totalSubmissions} Submissions in {selectedYear}
        </h2>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border px-3 py-1 rounded-md"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">

        {/* Month labels (aligned cleanly) */}
        <div className="flex ml-10 mb-1">
          {weeks.map((_, index) => (
            <div
              key={index}
              className="w-4 text-xs text-gray-500"
            >
              {monthLabels[index] || ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex">
          
          {/* Day labels */}
          <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 py-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Weeks */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.count} submissions • ${day.date.toDateString()}`}
                    className={`w-[13px] h-[13px] rounded-sm ${getColor(
                      day.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-[#ebedf0] rounded" />
            <div className="w-3 h-3 bg-[#9be9a8] rounded" />
            <div className="w-3 h-3 bg-[#40c463] rounded" />
            <div className="w-3 h-3 bg-[#30a14e] rounded" />
            <div className="w-3 h-3 bg-[#216e39] rounded" />
          </div>
          <span>More</span>
        </div>

      </div>
    </div>
  );
};

export default ActivityHeatmap;
