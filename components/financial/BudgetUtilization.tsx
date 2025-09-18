import React from 'react';

const BudgetUtilization = () => {
  const percentage = 82;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white lg:w-[500px] p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h3>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#fbbf24"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-gray-900">Actual vs Planned</div>
          <div className="text-sm text-gray-600">$8.2M / $10M</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetUtilization;