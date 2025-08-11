import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const SortStatsChart = ({ stats }) => {
  if (!stats.length) return <p>No stats yet. Run a sort to see stats here.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={stats}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="algo" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="time" fill="#8884d8" name="Time (ms)" />
        <Bar yAxisId="right" dataKey="swaps" fill="#82ca9d" name="Swaps" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SortStatsChart;