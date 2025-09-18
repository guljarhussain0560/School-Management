'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', attendance: 92 },
  { day: 'Tue', attendance: 89 },
  { day: 'Wed', attendance: 94 },
  { day: 'Thu', attendance: 91 },
  { day: 'Fri', attendance: 88 },
  { day: 'Sat', attendance: 85 },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Attendance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis domain={[80, 100]} stroke="#666" />
            <Line 
              type="monotone" 
              dataKey="attendance" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;