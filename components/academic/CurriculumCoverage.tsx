import React from 'react';

const CurriculumCoverage = () => {
  const percentage = 78;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white h-full p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Curriculum Coverage</h3>
      <div className="flex flex-col items-center space-y-6">
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
              stroke="#14b8a6"
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
          <div className="text-sm font-medium text-gray-900">Syllabus Completed</div>
          <div className="text-sm text-gray-600">vs Planned Schedule</div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCoverage;