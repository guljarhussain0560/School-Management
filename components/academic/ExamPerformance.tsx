import React from 'react';

const ExamPerformance = () => {
  const grades = [
    {
      grade: 'Grade 6',
      average: '81%',
      subjects: [
        { name: 'Math', score: 85, color: 'bg-green-200' },
        { name: 'Science', score: 78, color: 'bg-green-300' },
        { name: 'English', score: 82, color: 'bg-green-200' },
        { name: 'History', score: 79, color: 'bg-green-300' },
      ]
    },
    {
      grade: 'Grade 7',
      average: '83%',
      subjects: [
        { name: 'Math', score: 82, color: 'bg-green-200' },
        { name: 'Science', score: 84, color: 'bg-green-300' },
        { name: 'English', score: 79, color: 'bg-green-300' },
        { name: 'History', score: 85, color: 'bg-green-200' },
      ]
    },
    {
      grade: 'Grade 8',
      average: '83%',
      subjects: [
        { name: 'Math', score: 78, color: 'bg-green-300' },
        { name: 'Science', score: 88, color: 'bg-green-100' },
        { name: 'English', score: 85, color: 'bg-green-200' },
        { name: 'History', score: 82, color: 'bg-green-200' },
      ]
    },
    {
      grade: 'Grade 9',
      average: '86%',
      subjects: [
        { name: 'Math', score: 88, color: 'bg-green-100' },
        { name: 'Science', score: 85, color: 'bg-green-200' },
        { name: 'English', score: 86, color: 'bg-green-200' },
        { name: 'History', score: 84, color: 'bg-green-200' },
      ]
    },
    {
      grade: 'Grade 10',
      average: '90%',
      subjects: [
        { name: 'Math', score: 92, color: 'bg-green-100' },
        { name: 'Science', score: 89, color: 'bg-green-100' },
        { name: 'English', score: 91, color: 'bg-green-100' },
        { name: 'History', score: 87, color: 'bg-green-200' },
      ]
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Performance</h3>
      <div className="space-y-4">
        {grades.map((grade, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">{grade.grade}</h4>
              <span className="text-sm text-gray-600">Avg: {grade.average}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {grade.subjects.map((subject, subIndex) => (
                <div key={subIndex} className={`${subject.color} rounded-lg p-3 text-center`}>
                  <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                  <div className="text-lg font-semibold text-gray-900">{subject.score}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamPerformance;