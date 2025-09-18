'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { category: 'Teaching', amount: 250 },
  { category: 'Administration', amount: 80 },
  { category: 'Support Staff', amount: 60 },
  { category: 'Management', amount: 40 },
];

const PayrollExpenses = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Expenses</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" />
            <YAxis dataKey="category" type="category" stroke="#666" width={80} />
            <Bar dataKey="amount" fill="#14b8a6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayrollExpenses;