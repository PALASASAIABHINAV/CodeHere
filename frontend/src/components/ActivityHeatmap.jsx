// components/ActivityHeatmap.jsx - Enhanced version with strict month separation
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

  // Colors exactly like GitHub
  const getColor = (count) => {
    if (count === 0) return "bg-[#ebedf0]";
    if (count <= 2) return "bg-[#9be9a8]";
    if (count <= 4) return "bg-[#40c463]";
    if (count <= 7) return "bg-[#30a14e]";
    return "bg-[#216e39]";
  };

  const totalSubmissions = yearData.reduce((sum, h) => sum + h.count, 0);
  const totalActiveDays = yearData.filter((h) => h.count > 0).length;

  // Calculate max streak and current streak
  const { maxStreak, currentStreakCount } = useMemo(() => {
    const sortedDates = yearData
      .filter((h) => h.count > 0)
      .map((h) => new Date(h.date))
      .sort((a, b) => a - b);

    let max = 0;
    let temp = 1;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i > 0) {
        const dayDiff = Math.floor(
          (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          temp++;
        } else {
          max = Math.max(max, temp);
          temp = 1;
        }
      }
    }
    max = Math.max(max, temp);

    // Calculate current streak (from today backwards)
    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const isoDate = checkDate.toISOString().split("T")[0];
      const found = yearData.find(
        (h) => h.date.startsWith(isoDate) && h.count > 0
      );

      if (found) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (current > 0) {
        break;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return { maxStreak: max, currentStreakCount: current };
  }, [yearData]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // --- STRICT MONTH SEPARATION LOGIC ---

  // Helper: Get all weeks for a specific month (padded to start on Monday)
  const getMonthWeeks = (year, month) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Last day of month

    // Adjust start to previous Monday
    const startDay = start.getDay(); // Sun=0
    const offset = startDay === 0 ? 6 : startDay - 1;
    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - offset);

    // Generate days until we cover the end date + finish that week
    const weeks = [];
    let currentWeek = [];
    let current = new Date(gridStart);

    // Loop until we pass the end AND finish the current week (Monday check)
    while (current <= end || current.getDay() !== 1) {
      const isCurrentMonth = current.getMonth() === month;
      const iso = current.toISOString().split("T")[0];
      const found = yearData.find((h) => h.date.startsWith(iso));

      currentWeek.push({
        date: new Date(current),
        count: found ? found.count : 0,
        isCurrentMonth, // Key flag for visibility
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    return weeks;
  };

  // Generate data for all 12 months
  const allMonthsData = useMemo(() => {
    return monthNames.map((_, index) => ({
      monthIndex: index,
      name: monthNames[index],
      weeks: getMonthWeeks(selectedYear, index),
    }));
  }, [selectedYear, yearData]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6 shadow-sm">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
          <h2 className="text-sm text-gray-600 whitespace-nowrap">
            <span className="text-xl font-black text-gray-900">
              {totalSubmissions}
            </span>{" "}
            submissions in {selectedYear}
          </h2>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div className="text-gray-600">
              Total active days:{" "}
              <span className="font-bold text-gray-900">{totalActiveDays}</span>
            </div>
            <div className="text-gray-600">
              Max streak:{" "}
              <span className="font-bold text-gray-900">{maxStreak}</span>
            </div>
            <div className="text-gray-600">
              Current:{" "}
              <span className="font-bold text-gray-900">
                {currentStreakCount}
              </span>
            </div>
          </div>
        </div>

        {/* Year/Month Tabs */}
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode("year")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "year"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              Year
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" && (
        <div className="mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Heatmap Container */}
      <div className="w-full overflow-x-auto pb-2">
        {viewMode === "year" ? (
          // --- YEAR VIEW ---
          <div className="flex gap-4 min-w-max">
            {/* Day Labels (Mon/Wed/Fri) */}
            <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium py-[18px] h-[106px] sticky left-0 bg-white z-10">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Months Row */}
            {allMonthsData.map((month) => (
              <div key={month.name} className="flex flex-col gap-2">
                {/* Month Name */}
                <span className="text-xs font-medium text-gray-500 pl-0.5">
                  {month.name}
                </span>

                {/* Weeks Grid */}
                <div className="flex gap-[3px]">
                  {month.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          title={
                            day.isCurrentMonth
                              ? `${day.count} submissions on ${day.date.toDateString()}`
                              : ""
                          }
                          className={`w-[11px] h-[11px] rounded-[2px] transition-colors ${day.isCurrentMonth
                              ? getColor(day.count)
                              : "bg-transparent" // INVISIBLE if not in current month
                            }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- MONTH VIEW ---
          <div className="flex gap-4">
            <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium py-[18px] h-[106px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500 pl-0.5">
                {monthNames[selectedMonth]}
              </span>
              <div className="flex gap-[3px]">
                {allMonthsData[selectedMonth].weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        title={
                          day.isCurrentMonth
                            ? `${day.count} submissions on ${day.date.toDateString()}`
                            : ""
                        }
                        className={`w-[11px] h-[11px] rounded-[2px] transition-colors ${
                          // In single month view, we might choose to show all or still strict.
                          // Strict adds clarity even here.
                          day.isCurrentMonth
                            ? getColor(day.count)
                            : "bg-gray-50 opacity-30" // Faint for non-month days in single view? Or transparent? Let's go transparent for consistency
                          }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-6 md:ml-8">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-[11px] h-[11px] bg-[#ebedf0] rounded-[2px]" />
            <div className="w-[11px] h-[11px] bg-[#9be9a8] rounded-[2px]" />
            <div className="w-[11px] h-[11px] bg-[#40c463] rounded-[2px]" />
            <div className="w-[11px] h-[11px] bg-[#30a14e] rounded-[2px]" />
            <div className="w-[11px] h-[11px] bg-[#216e39] rounded-[2px]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
