import React from 'react';
import FeeCollection from '@/components/financial/FeeCollection';
import PayrollExpenses from '@/components/financial/PayrollExpenses';
import BudgetUtilization from '@/components/financial/BudgetUtilization';
import RevenueForecast from '@/components/financial/RevenueForecast';

const FinancialView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Financial Overview</h2>
        <p className="text-gray-600">Monitor revenue, expenses, and budget utilization</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[" >
        <FeeCollection />
        <PayrollExpenses />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0 lg:h-[400px]">
        <BudgetUtilization />
        <RevenueForecast />
      </div>
    </div>
  );
};

export default FinancialView;