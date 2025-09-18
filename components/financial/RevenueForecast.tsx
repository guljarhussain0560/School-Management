'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Oct', projected: 0.9, actual: 0.9 },
  { month: 'Nov', projected: 0.95, actual: 0.95 },
  { month: 'Dec', projected: 1.0, actual: null },
  { month: 'Jan', projected: 1.1, actual: null },
  { month: 'Feb', projected: 1.15, actual: null },
  { month: 'Mar', projected: 1.2, actual: null },
];

const RevenueForecast = () => {
  return (
    <div className="bg-white lg:w-[1200px] p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis domain={[0, 1.3]} stroke="#666" />
            <Line 
              type="monotone" 
              dataKey="projected" 
              stroke="#f97316" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#14b8a6" 
              strokeWidth={2}
              dot={{ fill: '#14b8a6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-gray-600">Projected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-sm text-gray-600">Actual</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecast;