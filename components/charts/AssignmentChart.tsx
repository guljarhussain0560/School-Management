'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Math', completion: 85 },
  { subject: 'Science', completion: 92 },
  { subject: 'English', completion: 78 },
  { subject: 'History', completion: 88 },
  { subject: 'Art', completion: 95 },
];

const AssignmentChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Completion</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="subject" stroke="#666" />
            <YAxis domain={[0, 100]} stroke="#666" />
            <Bar dataKey="completion" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssignmentChart;