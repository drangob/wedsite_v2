"use client";

import { api } from "@/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TopSongsChart = () => {
  const {
    data: topSongs,
    isLoading,
    error,
  } = api.spotify.getTopSongs.useQuery();

  if (isLoading) return <p>Loading top songs...</p>;
  if (error) return <p>Error loading top songs: {error.message}</p>;
  if (!topSongs || topSongs.length === 0) return <p>No suggested songs yet.</p>;

  const chartData = topSongs.map((song) => ({
    name: `${song.trackName} - ${song.artistNames.join(", ")}`,
    suggestions: song.suggestionCount,
  }));
  const COLORS = ["#356468", "#91a5a1", "#d7b09e", "#eccdc3"];

  return (
    <div className="w-full p-6">
      <h2 className="mb-4 text-center text-2xl font-semibold">
        Top 10 Suggested Songs
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            domain={[0, "dataMax"]}
            tick={{ fontSize: "0.8rem" }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            interval={0}
            tick={{ fontSize: "0.8rem" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#2D3748",
              border: "none",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: "#E2E8F0", fontSize: "0.8rem" }}
            itemStyle={{ color: "#E2E8F0", fontSize: "0.8rem" }}
          />
          <Bar dataKey="suggestions" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSongsChart;
