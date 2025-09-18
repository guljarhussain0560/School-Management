'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', usage: 165 },
  { day: 'Tue', usage: 158 },
  { day: 'Wed', usage: 172 },
  { day: 'Thu', usage: 169 },
  { day: 'Fri', usage: 160 },
];

const TransportUsage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Usage</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis domain={[140, 180]} stroke="#666" />
            <Bar dataKey="usage" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">Daily bus ridership</p>
    </div>
  );
};

export default TransportUsage;