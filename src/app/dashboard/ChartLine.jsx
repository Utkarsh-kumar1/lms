"use client";
import api from "@/axios";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";
import React, { use, useEffect, useState } from "react";
import colors from "tailwindcss/colors";

async function fetchChartLineData() {
  // Fetch activities and revisions for the last 6 days for chart data
  const response = await api.get("/chartData", {
    params: {
      n: '6',
    },
  });


  const result = response.data.data;

  // Helper function to get the name of the day
  const getDayName = (date) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

  // Helper function to get the dates for the last 6 days
  const getLast6Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        dayName: getDayName(date),
        date,
      });
    }

    return days;
  };

  const processResults = (data) => {
    return data?.reduce((acc, item) => {
      const dayName = getDayName(
        new Date(item.end || item.startDate || item.dueDate)
      );
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});
  };

  let activityCounts = processResults(result.activities);
  let revisionCounts = processResults(result.revisions);
  let dailyActivitiesScheduledsCounts = processResults(result.tasks);

  // Check if any count length is 0 then add Mon to 0
  if (!activityCounts || Object.keys(activityCounts).length === 0) {
    activityCounts = {};
    activityCounts["Mon"] = 0;
  }
  if (!revisionCounts || Object.keys(revisionCounts).length === 0) {
    revisionCounts = {};
    revisionCounts["Mon"] = 0;
  }
  if (!dailyActivitiesScheduledsCounts || Object.keys(dailyActivitiesScheduledsCounts).length === 0) {
    dailyActivitiesScheduledsCounts = {};
    dailyActivitiesScheduledsCounts["Mon"] = 0;
  }


  // Get the last 6 days in the correct order
  const last6Days = getLast6Days();

  // Map the results to match the last 6 days
  const activityResult = last6Days.map(({ dayName }) => ({
    id: "activity",
    x: dayName,
    y: activityCounts[dayName] || 0,
  }));

  const revisionResult = last6Days.map(({ dayName }) => ({
    id: "revision",
    x: dayName,
    y: revisionCounts[dayName] || 0,
  }));
  const dailyActivitiesScheduledsResult = last6Days.map(({ dayName }) => ({
    id: "DailyActivity",
    x: dayName,
    y: dailyActivitiesScheduledsCounts[dayName] || 0,
  }));

  // Format the final response for Nivo
  return [
    {
      id: "activity",
      color: "hsl(81, 70%, 50%)",
      data: activityResult,
    },
    {
      id: "revision",
      color: "hsl(70, 70%, 50%)",
      data: revisionResult,
    },
    {
      id: "DailyActivity",
      color: "hsl(70, 70%, 50%)",
      data: dailyActivitiesScheduledsResult,
    },
  ];
}

export default function ChartLine() {
  const { theme: themeMode } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(themeMode === "dark");
  const [data, setData] = useState(null);
  // const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch chart data from the API
        const chartData = await fetchChartLineData();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Check if all y-values are zero
  const allZero = data?.every((series) =>
    series.data.every((point) => point.y === 0)
  );

  // Set the minimum Y-axis value based on whether all y-values are zero
  const maxYValue = allZero ? 4 : "auto";

  useEffect(() => {
    setIsDarkMode(themeMode === "dark");
  }, [themeMode]);

  // Define the theme for dark mode and light mode using Tailwind colors
  const theme = {
    background: isDarkMode ? colors.gray[900] : colors.white,
    textColor: isDarkMode ? colors.white : colors.gray[800],
    axis: {
      domain: {
        line: {
          stroke: isDarkMode ? colors.gray[500] : colors.gray[700],
        },
      },
      ticks: {
        line: {
          stroke: isDarkMode ? colors.gray[400] : colors.gray[600],
        },
        text: {
          fill: isDarkMode ? colors.gray[300] : colors.gray[800],
        },
      },
    },
    grid: {
      line: {
        stroke: isDarkMode ? colors.gray[700] : colors.gray[200],
      },
    },
    legends: {
      text: {
        fill: isDarkMode ? colors.gray[200] : colors.gray[800],
      },
    },
    tooltip: {
      container: {
        background: isDarkMode ? colors.gray[700] : colors.white,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        border: `1px solid ${isDarkMode ? colors.gray[600] : colors.gray[300]}`,
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
      },
    },
  };

  if (loading || !data) {
    return <Loader />;
  }

  return (
    <div>
      {data ? (
        <div className="w-full h-[30rem]">
          <ResponsiveLine
            enableArea
            areaOpacity={0.1}
            curve="monotoneX"
            data={data}
            margin={{ top: 20, right: 40, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: maxYValue,
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Completed",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            colors={{ scheme: "category10" }}
            pointSize={10}
            pointColor={{ from: "color", modifiers: [] }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabel="data.yFormatted"
            pointLabelYOffset={-12}
            enableTouchCrosshair={true}
            useMesh={true}
            legends={[
              {
                anchor: "top-right",
                direction: "column",
                justify: false,
                translateX: 0,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: colors.gray[500],
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(255, 255, 255, .1)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            theme={theme} // Apply the theme here, including the tooltip styles
          />
        </div>
      ) : null}
    </div>
  );
}
