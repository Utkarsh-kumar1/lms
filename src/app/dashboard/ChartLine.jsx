import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import colors from "tailwindcss/colors";

export default function ChartLine({ data }) {
  const { theme: themeMode } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(themeMode === "dark");

  useEffect(() => {
    setIsDarkMode(themeMode === "dark");
  }, [themeMode]);

  // Check if all y-values are zero
  const allZero = data.every((series) =>
    series.data.every((point) => point.y === 0)
  );

  // Set the minimum Y-axis value based on whether all y-values are zero
  const maxYValue = allZero ? 4 : "auto";

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
