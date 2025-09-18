import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const SafetyAlerts = () => {
  const incidents = [
    {
      id: 'SA-001',
      incident: 'Minor injury during sports',
      severity: 'Low',
      date: '2024-09-09',
      status: 'Resolved',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      id: 'SA-002',
      incident: 'Fire drill evacuation delay',
      severity: 'Medium',
      date: '2024-09-08',
      status: 'Open',
      color: 'bg-yellow-100 text-yellow-800',
      icon: AlertCircle,
    },
    {
      id: 'SA-003',
      incident: 'Playground equipment check',
      severity: 'Low',
      date: '2024-09-07',
      status: 'In Progress',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
    },
    {
      id: 'SA-004',
      incident: 'Bus safety inspection due',
      severity: 'High',
      date: '2024-09-06',
      status: 'Open',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
    },
    {
      id: 'SA-005',
      incident: 'Security camera malfunction',
      severity: 'Medium',
      date: '2024-09-05',
      status: 'Resolved',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Alerts</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="pb-2 font-medium text-gray-700">Incident</th>
              <th className="pb-2 font-medium text-gray-700">Severity</th>
              <th className="pb-2 font-medium text-gray-700">Date</th>
              <th className="pb-2 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incidents.map((incident) => {
              const Icon = incident.icon;
              return (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900">{incident.incident}</div>
                      <div className="text-gray-600">{incident.id}</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'High' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{incident.date}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <Icon size={16} className={
                        incident.status === 'Resolved' ? 'text-green-600' :
                        incident.status === 'In Progress' ? 'text-blue-600' :
                        'text-yellow-600'
                      } />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${incident.color}`}>
                        {incident.status}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SafetyAlerts;