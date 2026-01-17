// components/ActivityHeatmap.jsx
import React, { useState, useMemo } from "react";

const ActivityHeatmap = ({ heatmapData = [] }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [viewMode, setViewMode] = useState("year"); // "year" or "month"

  // Filter by selected year
  const yearData = useMemo(() => {
    return heatmapData.filter((h) => h.date.startsWith(String(selectedYear)));
  }, [heatmapData, selectedYear]);

  // Build all days for the year
  const yearDays = useMemo(() => {
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

  // Build days for a specific month
  const monthDays = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);

    // Offset so first column starts on Monday
    const weekday = start.getDay();
    const offset = weekday === 0 ? 6 : weekday - 1;
    start.setDate(start.getDate() - offset);

    const result = [];
    let current = new Date(start);

    // Extend until the end of the month's last week
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
  }, [selectedYear, selectedMonth, yearData]);

  // Group year days into weeks by month (for spacing)
  const monthGroups = useMemo(() => {
    const groups = [];
    let currentMonthWeeks = [];
    let lastMonth = null;

    for (let i = 0; i < yearDays.length; i += 7) {
      const week = yearDays.slice(i, i + 7);
      const weekMonth = week[0].date.getMonth();

      if (lastMonth !== null && weekMonth !== lastMonth) {
        groups.push({ month: lastMonth, weeks: currentMonthWeeks });
        currentMonthWeeks = [];
      }

      currentMonthWeeks.push(week);
      lastMonth = weekMonth;
    }

    if (currentMonthWeeks.length > 0) {
      groups.push({ month: lastMonth, weeks: currentMonthWeeks });
    }

    return groups;
  }, [yearDays]);

  // Group month days into weeks
  const monthWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }
    return weeks;
  }, [monthDays]);

  // Colors exactly like GitHub
  const getColor = (count) => {
    if (count === 0) return "bg-[#ebedf0]";
    if (count <= 2) return "bg-[#9be9a8]";
    if (count <= 4) return "bg-[#40c463]";
    if (count <= 7) return "bg-[#30a14e]";
    return "bg-[#216e39]";
  };

  const totalSubmissions = yearData.reduce((sum, h) => sum + h.count, 0);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-white rounded-lg border p-6 mt-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-sm text-gray-600">
            {totalSubmissions} Submissions in{" "}
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
              {viewMode === "year" ? `Year ${selectedYear}` : `${monthNames[selectedMonth]} ${selectedYear}`}
            </span>
          </h2>
        </div>

        {/* Year/Month Tabs */}
        <div className="flex items-center gap-1 border rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode("year")}
            className={`px-4 py-1 text-sm font-medium ${viewMode === "year"
              ? "bg-gray-100 text-gray-700"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Year
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-1 text-sm font-medium ${viewMode === "month"
              ? "bg-gray-100 text-gray-700"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Year Selector Dropdown */}
      <div className="mb-4 flex gap-3">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border px-3 py-1.5 rounded-md text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Month selector (only shown in month view) */}
        {viewMode === "month" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border px-3 py-1.5 rounded-md text-sm"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">

        {viewMode === "year" ? (
          // YEAR VIEW - with month spacing
          <>
            {/* Month labels */}
            <div className="flex ml-10 mb-2 gap-3">
              {monthGroups.map((group, idx) => (
                <div
                  key={idx}
                  style={{ width: `${group.weeks.length * 16}px` }}
                  className="text-xs text-gray-500"
                >
                  {monthNames[group.month]}
                </div>
              ))}
            </div>

            {/* Grid with month separators */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 py-1 h-[90px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Month groups with spacing */}
              <div className="flex gap-3">
                {monthGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex gap-[3px]">
                    {group.weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px]">
                        {week.map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            title={`${day.count} submissions • ${day.date.toDateString()}`}
                            className={`w-[13px] h-[13px] rounded-sm ${getColor(day.count)}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // MONTH VIEW
          <>
            <div className="flex ml-10 mb-2">
              <div className="text-xs text-gray-500">
                {monthNames[selectedMonth]}
              </div>
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 py-1 h-[90px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Weeks */}
              <div className="flex gap-[3px]">
                {monthWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        title={`${day.count} submissions • ${day.date.toDateString()}`}
                        className={`w-[13px] h-[13px] rounded-sm ${getColor(day.count)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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
