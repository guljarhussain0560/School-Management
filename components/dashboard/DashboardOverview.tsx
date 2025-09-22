'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, DollarSign, Bus, Briefcase, TrendingUp, TrendingDown,
  UserPlus, FileSpreadsheet, Calendar, AlertCircle, CheckCircle,
  GraduationCap, BookOpen, Clock, BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  activeBuses: number;
  totalEmployees: number;
  feeCollectionRate: number;
  attendanceRate: number;
  recentAdmissions: number;
  pendingTasks: number;
}

interface RecentActivity {
  id: string;
  type: 'admission' | 'payment' | 'maintenance' | 'alert' | 'academic';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRevenue: 0,
    activeBuses: 0,
    totalEmployees: 0,
    feeCollectionRate: 0,
    attendanceRate: 0,
    recentAdmissions: 0,
    pendingTasks: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from multiple endpoints
      const [studentsRes, revenueRes, busesRes, employeesRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard/stats/students'),
        fetch('/api/dashboard/stats/revenue'),
        fetch('/api/dashboard/stats/buses'),
        fetch('/api/dashboard/stats/employees'),
        fetch('/api/dashboard/activities')
      ]);

      const [studentsData, revenueData, busesData, employeesData, activitiesData] = await Promise.all([
        studentsRes.json(),
        revenueRes.json(),
        revenueRes.json(),
        busesRes.json(),
        employeesRes.json(),
        activitiesRes.json()
      ]);

      setStats({
        totalStudents: studentsData.count || 0,
        totalRevenue: revenueData.total || 0,
        activeBuses: busesData.active || 0,
        totalEmployees: employeesData.count || 0,
        feeCollectionRate: revenueData.collectionRate || 0,
        attendanceRate: studentsData.attendanceRate || 0,
        recentAdmissions: studentsData.recentAdmissions || 0,
        pendingTasks: activitiesData.pendingTasks || 0
      });

      setRecentActivities(activitiesData.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-student',
      title: 'Add New Student',
      description: 'Register a new student',
      icon: UserPlus,
      action: () => {
        // Navigate to student registration
        window.location.href = '/admin?section=admissions&subsection=student-onboarding';
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'collect-fee',
      title: 'Collect Fee',
      description: 'Record fee payment',
      icon: DollarSign,
      action: () => {
        // Navigate to fee collection
        window.location.href = '/admin?section=financial&subsection=fee-collections';
      },
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'bus-status',
      title: 'Bus Status',
      description: 'Check transport status',
      icon: Bus,
      action: () => {
        // Navigate to transport
        window.location.href = '/admin?section=transport&subsection=operations-dashboard';
      },
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create system reports',
      icon: FileSpreadsheet,
      action: () => {
        // Navigate to reports
        window.location.href = '/admin?section=reports&subsection=academic-reports';
      },
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'admission': return <UserPlus className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Bus className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.recentAdmissions}</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBuses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">100%</span> operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Active</span> staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Rate</CardTitle>
            <CardDescription>Current month fee collection performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span>{stats.feeCollectionRate}%</span>
              </div>
              <Progress value={stats.feeCollectionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Target: 95% | Current: {stats.feeCollectionRate}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Overall student attendance performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span>{stats.attendanceRate}%</span>
              </div>
              <Progress value={stats.attendanceRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Target: 90% | Current: {stats.attendanceRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <IconComponent className="h-6 w-6" />
                    <div className="text-center">
                      <p className="text-xs font-medium">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.pendingTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.pendingTasks} pending tasks require attention
                    </p>
                    <p className="text-xs text-yellow-600">Review and complete pending items</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Tasks
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    System running smoothly
                  </p>
                  <p className="text-xs text-blue-600">All services operational</p>
                </div>
              </div>
              <Badge variant="secondary">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
