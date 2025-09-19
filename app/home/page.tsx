'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import AcademicView from '@/components/views/AcademicView';
import FinancialView from '@/components/views/FinancialView';
import OperationsView from '@/components/views/OperationsView';
import AdminManagementDashboard from '@/components/admin/AdminManagementDashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('academic');

  // Get available tabs based on user role
  const getAvailableTabs = useCallback(() => {
    if (!session?.user?.role) return ['academic'];
    
    switch (session.user.role) {
      case 'ADMIN':
        return ['academic', 'financial', 'operations'];
      case 'TEACHER':
        return ['academic'];
      case 'TRANSPORT':
        return ['operations'];
      default:
        return ['academic'];
    }
  }, [session?.user?.role]);

  // Set default active tab based on user role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Set default tab based on role
    const availableTabs = getAvailableTabs();
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [session, status, router, activeTab, getAvailableTabs]);

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

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Show visual dashboard for admin users with Management Dashboard button
  if (session.user.role === 'ADMIN') {
    return (
      <div className="min-h-screen lg:w-[100%] bg-gray-50">
        <div className="lg:max-w-[90%] md:w-[97%] sm:w-[99%] mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800">Welcome back, {session.user.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/admin')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Management Dashboard
              </Button>
            </div>
          </div>
          <DashboardHeader />
          <div>
            <a href="/input-portal" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Open Input Portal</a>
          </div>
          <DashboardTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            availableTabs={getAvailableTabs()}
          />
          <div className="transition-all duration-300 ease-in-out">
            {renderActiveView()}
          </div>
        </div>
      </div>
    );
  }

  // Show regular dashboard for teachers and transport users
  return (
    <div className="min-h-screen lg:w-[100%] bg-gray-50">
      <div className="lg:max-w-[90%] md:w-[97%] sm:w-[99%] mx-auto p-6 space-y-6">
        <DashboardHeader />
        <div>
          <a href="/input-portal" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Open Input Portal</a>
        </div>
        <DashboardTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          availableTabs={getAvailableTabs()}
        />
        <div className="transition-all duration-300 ease-in-out">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
}


