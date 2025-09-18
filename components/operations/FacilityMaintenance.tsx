'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Open', value: 12, color: '#f97316' },
  { name: 'In Progress', value: 8, color: '#0f766e' },
  { name: 'Resolved', value: 45, color: '#16a34a' },
];

const FacilityMaintenance = () => {
  return (
    <div className="bg-white p-6 w-[500px] rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Maintenance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FacilityMaintenance;