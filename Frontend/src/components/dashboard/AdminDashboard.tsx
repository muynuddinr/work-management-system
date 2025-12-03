'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI } from '@/lib/api';
import { Users, ClipboardList, Calendar, TrendingUp, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getAdminDashboard();
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back! Here's your program overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-linear-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">Total Employees</CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{data?.overview?.totalInterns || 0}</div>
            <p className="text-xs text-blue-100 mt-1">{data?.overview?.activeInterns || 0} active</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-100">Total Tasks</CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{data?.overview?.totalTasks || 0}</div>
            <p className="text-xs text-purple-100 mt-1">{data?.overview?.completedTasks || 0} completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-100">Present Today</CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{data?.overview?.todayAttendance || 0}</div>
            <p className="text-xs text-green-100 mt-1">{data?.overview?.attendancePercentage || 0}% rate</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-100">Pending Reviews</CardTitle>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{data?.pending?.workLogs || 0}</div>
            <p className="text-xs text-orange-100 mt-1">Work logs to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-yellow-50 to-orange-50">
            <CardTitle className="text-lg">Pending Leaves</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-orange-600">{data?.pending?.leaves || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-blue-600">{data?.pending?.tasks || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Not yet started</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-lg">Work Log Reviews</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-purple-600">{data?.pending?.workLogs || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Need feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-linear-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Latest task assignments</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.recentActivities?.tasks?.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivities.tasks.slice(0, 5).map((task: any) => (
                  <div key={task._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className={`p-2 rounded-lg ${
                      task.status === 'completed' ? 'bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : task.status === 'in-progress' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {typeof task.assignedTo === 'object' && task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                      </p>
                    </div>
                    <Badge className={
                      task.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No recent tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Work Logs</CardTitle>
                <p className="text-sm text-muted-foreground">Latest submissions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.recentActivities?.workLogs?.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivities.workLogs.slice(0, 5).map((log: any) => (
                  <div key={log._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{log.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {typeof log.userId === 'object' ? log.userId.name : 'Unknown'}
                      </p>
                    </div>
                    <Badge className={
                      log.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      log.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No recent work logs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
