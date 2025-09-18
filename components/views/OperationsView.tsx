import React from 'react';
import BusTracking from '@/components/operations/BusTracking';
import TransportUsage from '@/components/operations/TransportUsage';
import FacilityMaintenance from '@/components/operations/FacilityMaintenance';
import SafetyAlerts from '@/components/operations/SafetyAlerts';

const OperationsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Operations & Transport</h2>
        <p className="text-gray-600">Track transport, facilities, and safety management</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BusTracking />
        <TransportUsage />
      </div>
      
      <div className="flex flex-col xl:flex-row xl:space-x-6 space-y-6 xl:space-y-0">
        <FacilityMaintenance />
        <SafetyAlerts />
      </div>
    </div>
  );
};

export default OperationsView;