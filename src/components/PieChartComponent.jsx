
import React from "react";
import { Pie, PieChart, Label, Cell, Tooltip } from "recharts";

const PieChartComponent = ({ data, title }) => {
  const totalItems = data.reduce((acc, item) => acc + item.value, 0);
  
  
  if(!data[0].value && !data[1].value)
  {
    return <div>No {title} found</div>
  }

  return (
    <div className="flex flex-col items-center">
      <PieChart width={150} height={150}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={70}
          fill="#8884d8"
          strokeWidth={4}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalItems.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      {title}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <Tooltip
          content={({ payload }) => {
            if (payload && payload.length) {
              const { name, value } = payload[0].payload;
              return (
                <div className="bg-white p-2 rounded border border-gray-200 shadow-md">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-gray-500">Count: {value}</p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ fill: "transparent" }}
        />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;
