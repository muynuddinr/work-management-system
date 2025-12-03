'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardAPI, attendanceAPI } from '@/lib/api';
import { CheckSquare, Calendar, FileText, Award, Clock, LogIn, LogOut as LogOutIcon, Trophy, Target, TrendingUp, ClipboardList } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function InternDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getInternDashboard();
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkIn();
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkOut();
      fetchDashboard();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingIn(false);
    }
  };

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
            Welcome Back!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Track your progress and manage your tasks</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
          <Trophy className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Keep up the great work!</span>
        </div>
      </div>

      {/* Quick Actions - Attendance */}
      <Card className="border-0 shadow-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Today's Attendance</CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                {data?.attendance?.today ? (data.attendance.today.checkOut ? 'Day completed' : 'Currently checked in') : 'Ready to start your day?'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex items-center gap-4">
            {!data?.attendance?.today && (
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="flex-1 h-14 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Check In
              </Button>
            )}
            {data?.attendance?.today && !data.attendance.today.checkOut && (
              <>
                <Button
                  disabled
                  className="flex-1 h-14 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 font-semibold opacity-50"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Checked In
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                  className="flex-1 h-14 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                >
                  <LogOutIcon className="h-5 w-5 mr-2" />
                  Check Out
                </Button>
              </>
            )}
            {data?.attendance?.today?.checkOut && (
              <div className="flex-1 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/30 font-semibold">
                ✓ Day Completed
              </div>
            )}
          </div>

          {data?.attendance?.today && (
            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <LogIn className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Check In</p>
                  <p className="font-semibold">{formatTime(data.attendance.today.checkIn)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <LogOutIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Check Out</p>
                  <p className="font-semibold">{data.attendance.today.checkOut ? formatTime(data.attendance.today.checkOut) : '--:--'}</p>
                </div>
              </div>
              {data.attendance.today.totalHours > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-100">Total Hours</p>
                    <p className="font-semibold">{data.attendance.today.totalHours}h</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-br from-green-50 to-emerald-50">
            <CardTitle className="text-sm font-semibold text-gray-700">Completed Tasks</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-900">{data?.tasks?.completed || 0}/{data?.tasks?.total || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">{data?.tasks?.completionRate || 0}% completion</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-br from-blue-50 to-cyan-50">
            <CardTitle className="text-sm font-semibold text-gray-700">Attendance Rate</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-900">{data?.attendance?.attendancePercentage || 0}%</div>
            <p className="text-sm text-muted-foreground mt-1">{data?.attendance?.present || 0}/{data?.attendance?.total || 0} days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-br from-purple-50 to-pink-50">
            <CardTitle className="text-sm font-semibold text-gray-700">Work Logs</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-900">{data?.workLogs?.total || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {data?.workLogs?.averageRating ? `Avg: ${data.workLogs.averageRating} ⭐` : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-br from-orange-50 to-red-50">
            <CardTitle className="text-sm font-semibold text-gray-700">Performance</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-900">
              {data?.latestEvaluation ? `${data.latestEvaluation.overallRating}/5` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Latest evaluation</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-gray-50 to-slate-50">
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-600">{data?.tasks?.pending || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Not started</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-blue-600">{data?.tasks?.inProgress || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-linear-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-green-600">{data?.tasks?.completed || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent and Upcoming Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-linear-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Your latest assignments</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.recentTasks?.length > 0 ? (
              <div className="space-y-4">
                {data.recentTasks.map((task: any) => (
                  <div key={task._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className={`p-2 rounded-lg mt-1 ${
                      task.status === 'completed' ? 'bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <ClipboardList className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }`}>
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
          <CardHeader className="border-b bg-linear-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Upcoming Deadlines</CardTitle>
                <p className="text-sm text-muted-foreground">Tasks due soon</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.upcomingTasks?.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingTasks.map((task: any) => (
                  <div key={task._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className={`p-2 rounded-lg mt-1 ${
                      task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Target className={`h-5 w-5 ${
                        task.priority === 'high' || task.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${
                      task.priority === 'high' || task.priority === 'urgent' ? 
                      'bg-red-100 text-red-700 hover:bg-red-100' : 
                      'bg-blue-100 text-blue-700 hover:bg-blue-100'
                    }`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
