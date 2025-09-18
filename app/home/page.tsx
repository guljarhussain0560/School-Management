'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import AcademicView from '@/components/views/AcademicView';
import FinancialView from '@/components/views/FinancialView';
import OperationsView from '@/components/views/OperationsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState('academic');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'academic':
        return <AcademicView />;
      case 'financial':
        return <FinancialView />;
      case 'operations':
        return <OperationsView />;
      default:
        return <AcademicView />;
    }
  };

  return (
    <div className="min-h-screen lg:w-[100%] bg-gray-50">
      <div className="lg:max-w-[90%] md:w-[97%] sm:w-[99%] mx-auto p-6 space-y-6">
        <DashboardHeader />
        <div>
          <a href="/input-portal" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Open Input Portal</a>
        </div>
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="transition-all duration-300 ease-in-out">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
}


