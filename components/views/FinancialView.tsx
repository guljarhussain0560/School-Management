import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeeCollection from '@/components/financial/FeeCollection';
import FeeStructureManagement from '@/components/financial/FeeStructureManagement';
import FeeCollectionManagement from '@/components/financial/FeeCollectionManagement';
import StudentFeeDetails from '@/components/financial/StudentFeeDetails';
import PayrollExpenses from '@/components/financial/PayrollExpenses';
import BudgetUtilization from '@/components/financial/BudgetUtilization';
import RevenueForecast from '@/components/financial/RevenueForecast';
import { DollarSign, Receipt, Users, BarChart3 } from 'lucide-react';

const FinancialView = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Financial Management</h2>
          <p className="text-gray-600">Manage fees, expenses, and financial operations</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fee-structures" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Fee Structures
          </TabsTrigger>
          <TabsTrigger value="fee-collections" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Fee Collections
          </TabsTrigger>
          <TabsTrigger value="student-fees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Fees
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeeCollection />
            <PayrollExpenses />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0 lg:h-[400px]">
            <BudgetUtilization />
            <RevenueForecast />
          </div>
        </TabsContent>

        {/* Fee Structures Tab */}
        <TabsContent value="fee-structures" className="space-y-4">
          <FeeStructureManagement />
        </TabsContent>

        {/* Fee Collections Tab */}
        <TabsContent value="fee-collections" className="space-y-4">
          <FeeCollectionManagement />
        </TabsContent>

        {/* Student Fees Tab */}
        <TabsContent value="student-fees" className="space-y-4">
          <StudentFeeDetails />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetUtilization />
            <RevenueForecast />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialView;