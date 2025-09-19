import React, { useState } from 'react';
import { GraduationCap, DollarSign, Settings, Menu } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs?: string[];
}


const DashboardTabs = ({ activeTab, onTabChange, availableTabs }: DashboardTabsProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const allTabs = [
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'operations', label: 'Operations', icon: Settings },
  ];

  // Filter tabs based on availableTabs prop
  const tabs = availableTabs 
    ? allTabs.filter(tab => availableTabs.includes(tab.id))
    : allTabs;

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden sm:flex space-x-1 bg-gray-200 p-1 rounded-lg w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Hamburger */}
      <div className="sm:hidden relative w-full">
        <button
          className="flex items-center px-4 py-3 bg-gray-200 rounded-lg w-full justify-between"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Open navigation menu"
        >
          <span className="font-medium text-gray-900">
            {tabs.find((tab) => tab.id === activeTab)?.label || 'Menu'}
          </span>
          <Menu size={22} />
        </button>
        {mobileOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center w-full space-x-2 px-4 py-3 rounded-md transition-all duration-200 justify-start ${
                    activeTab === tab.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardTabs;