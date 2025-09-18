import React from 'react';
import AttendanceChart from '@/components/charts/AttendanceChart';
import AssignmentChart from '@/components/charts/AssignmentChart';
import ExamPerformance from '@/components/academic/ExamPerformance';
import CurriculumCoverage from '@/components/academic/CurriculumCoverage';

const AcademicView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Academic Monitoring</h2>
        <p className="text-gray-600">Track student performance and curriculum progress</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <AssignmentChart />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ExamPerformance />
        </div>
        <div className="xl:col-span-1">
          <CurriculumCoverage />
        </div>
      </div>
    </div>
  );
};

export default AcademicView;