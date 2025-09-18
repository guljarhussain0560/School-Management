import React from 'react';
import { MapPin, Bus } from 'lucide-react';

const BusTracking = () => {
  const routes = [
    { id: 'A', street: 'Main Street', status: 'On Time', students: 45, color: 'bg-green-500' },
    { id: 'B', street: 'Park Avenue', status: 'Delayed', students: 38, color: 'bg-red-500' },
    { id: 'C', street: 'Oak Road', status: 'On Time', students: 42, color: 'bg-green-500' },
    { id: 'D', street: 'Pine Street', status: 'On Time', students: 35, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Tracking</h3>
      
      <div className="bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin size={32} className="text-gray-500 mx-auto" />
          <p className="text-gray-600">Live GPS Map View</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {routes.map((route) => (
          <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bus size={20} className="text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Route {route.id}</div>
                <div className="text-sm text-gray-600">{route.street}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  route.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {route.status}
                </div>
                <div className="text-sm text-gray-600 mt-1">{route.students} students</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusTracking;