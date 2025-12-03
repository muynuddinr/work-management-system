'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, formatDateForCSV, formatDateTimeForCSV } from '@/lib/csvUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { attendanceAPI } from '@/lib/api';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar, 
  Search,
  Filter,
  TrendingUp,
  XCircle,
  X,
  CalendarCheck,
  CalendarX,
  Download,
  LogIn,
  LogOut as LogOutIcon
} from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  user?: { _id: string; name: string; email: string };
  userId?: { _id: string; name: string; email: string };
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  type?: 'leave';
  status?: string;
  leaveType?: string;
  leaveReason?: string;
  leaveApproved?: boolean | null;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export default function AttendancePage() {
  const { user: currentUser } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'sick',
    startDate: '',
    reason: '',
  });

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType]);

  const loadAttendance = async () => {
    try {
      const res = await attendanceAPI.getAttendance();
      setRecords(res.data.data || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rec => {
        const userObj = rec.user || rec.userId;
        return userObj?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               userObj?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'leave') {
        filtered = filtered.filter(rec => rec.status === 'leave');
      } else if (filterType === 'attendance') {
        filtered = filtered.filter(rec => rec.status !== 'leave');
      } else if (filterType === 'pending') {
        filtered = filtered.filter(rec => rec.leaveApproved === null);
      }
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved') {
        filtered = filtered.filter(rec => rec.leaveApproved === true);
      } else if (filterStatus === 'rejected') {
        filtered = filtered.filter(rec => rec.leaveApproved === false);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(rec => rec.leaveApproved === null);
      }
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.date || rec.startDate || '');
        const startDate = new Date(dateRange.start);
        return recordDate >= startDate;
      });
    }
    if (dateRange.end) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.date || rec.endDate || '');
        const endDate = new Date(dateRange.end);
        return recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend expects: { date, leaveType, leaveReason }
      const requestData = {
        date: leaveFormData.startDate,
        leaveType: leaveFormData.leaveType,
        leaveReason: leaveFormData.reason
      };
      
      await attendanceAPI.requestLeave(requestData);
      setShowLeaveModal(false);
      setLeaveFormData({ leaveType: 'sick', startDate: '', reason: '' });
      loadAttendance();
      alert('Leave request submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request leave');
    }
  };

  const handleApprovalAction = async () => {
    if (!approvalModal) return;
    try {
      await attendanceAPI.approveLeave(approvalModal.id, approvalModal.action === 'approve');
      setApprovalModal(null);
      loadAttendance();
      alert(`Leave request ${approvalModal.action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to process leave request');
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkIn();
      setShowCheckInModal(false);
      loadAttendance();
      alert('Checked in successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkOut();
      loadAttendance();
      alert('Checked out successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Date', 'Type', 'Check In', 'Check Out', 'Total Hours', 'Status', 'Leave Type', 'Leave Reason'];
    const csvData = filteredRecords.map(rec => {
      const userObj = rec.user || rec.userId;
      const userName = (userObj && typeof userObj === 'object') ? userObj.name || '' : '';
      const userEmail = (userObj && typeof userObj === 'object') ? userObj.email || '' : '';
      
      return [
        userName,
        userEmail,
        formatDateForCSV(rec.date),
        rec.status === 'leave' ? 'Leave' : 'Attendance',
        rec.checkIn ? formatDateTimeForCSV(rec.checkIn) : '',
        rec.checkOut ? formatDateTimeForCSV(rec.checkOut) : '',
        rec.totalHours?.toString() || '',
        rec.status === 'leave' 
          ? (rec.leaveApproved === true ? 'Approved' : rec.leaveApproved === false ? 'Rejected' : 'Pending')
          : rec.status || 'Present',
        rec.leaveType || '',
        rec.leaveReason || ''
      ];
    });

    const filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, csvData);
  };

  // Check if user has checked in today
  const todayRecord = records.find(r => {
    const userObj = r.user || r.userId;
    return userObj?._id === currentUser?._id && 
           r.status !== 'leave' &&
           new Date(r.date).toDateString() === new Date().toDateString();
  });
  const hasCheckedIn = todayRecord && todayRecord.checkIn;
  const hasCheckedOut = todayRecord && todayRecord.checkOut;

  const stats = {
    total: records.length,
    present: records.filter(r => r.checkIn && r.status !== 'leave').length,
    leaves: records.filter(r => r.status === 'leave').length,
    pending: records.filter(r => r.status === 'leave' && r.leaveApproved === null).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-muted-foreground mt-2">Track check-ins, check-outs and manage leave requests</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'intern' && (
            <>
              {!hasCheckedIn ? (
                <Button onClick={handleCheckIn} className="gap-2" disabled={checkingIn}>
                  <LogIn className="h-5 w-5" />
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </Button>
              ) : !hasCheckedOut ? (
                <Button onClick={handleCheckOut} variant="outline" className="gap-2" disabled={checkingIn}>
                  <LogOutIcon className="h-5 w-5" />
                  {checkingIn ? 'Checking Out...' : 'Check Out'}
                </Button>
              ) : (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed for today
                </Badge>
              )}
              <Button onClick={() => setShowLeaveModal(true)} variant="outline" className="gap-2">
                <CalendarX className="h-5 w-5" />
                Request Leave
              </Button>
            </>
          )}
          {currentUser?.role === 'admin' && (
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.leaves}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search and Quick Filters */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Records</option>
                <option value="attendance">Attendance Only</option>
                <option value="leave">Leave Requests</option>
                <option value="pending">Pending Approvals</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {/* Row 2: Date Range and Results Count */}
            <div className="grid gap-4 md:grid-cols-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="h-10"
              >
                Clear Filters
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-10">
                <Filter className="h-4 w-4" />
                <span className="font-medium">{filteredRecords.length} records found</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <div className="grid gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((rec) => (
            <Card key={rec._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    rec.status === 'leave' 
                      ? rec.leaveApproved === true ? 'bg-green-100' : rec.leaveApproved === false ? 'bg-red-100' : 'bg-yellow-100'
                      : 'bg-blue-100'
                  }`}>
                    {rec.status === 'leave' ? (
                      rec.leaveApproved === true ? <CalendarCheck className="h-6 w-6 text-green-600" /> :
                      rec.leaveApproved === false ? <CalendarX className="h-6 w-6 text-red-600" /> :
                      <Calendar className="h-6 w-6 text-yellow-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {(rec.user || rec.userId)?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {(rec.user || rec.userId)?.email || ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.status === 'leave' && rec.leaveApproved !== undefined && (
                          <Badge className={
                            rec.leaveApproved === true ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            rec.leaveApproved === false ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                            'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          }>
                            {rec.leaveApproved === true ? 'Approved' : rec.leaveApproved === false ? 'Rejected' : 'Pending'}
                          </Badge>
                        )}
                        <Badge className={rec.status === 'leave' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                          {rec.status === 'leave' ? 'Leave' : 'Attendance'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                      {rec.status === 'leave' ? (
                        <>
                          <div className="flex items-center gap-6">
                            <span><strong>Type:</strong> {rec.leaveType || 'General'}</span>
                            <span><strong>Date:</strong> {new Date(rec.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted-foreground"><strong>Reason:</strong> {rec.leaveReason || rec.reason || '—'}</p>
                          {currentUser?.role === 'admin' && rec.leaveApproved === null && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button 
                                size="sm"
                                onClick={() => setApprovalModal({ id: rec._id, action: 'approve' })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => setApprovalModal({ id: rec._id, action: 'reject' })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-6">
                            <span><strong>Date:</strong> {new Date(rec.date).toLocaleDateString()}</span>
                            <span><strong>Check In:</strong> {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '—'}</span>
                            <span><strong>Check Out:</strong> {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '—'}</span>
                            {rec.totalHours && <span><strong>Hours:</strong> {rec.totalHours}h</span>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No attendance records</p>
              <p className="text-sm text-gray-400">Records will appear here when employees check in/out or request leave</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-0 shadow-2xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarX className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Request Leave</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowLeaveModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={handleRequestLeave} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Leave Type *</label>
                  <select
                    required
                    className="w-full h-11 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={leaveFormData.leaveType}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  >
                    <option value="sick">🤒 Sick Leave</option>
                    <option value="personal">👤 Personal Leave</option>
                    <option value="vacation">🏖️ Vacation</option>
                    <option value="emergency">🚨 Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Leave Date *</label>
                  <Input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    className="bg-white h-11"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select the date for your leave</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Reason *</label>
                  <Textarea
                    required
                    placeholder="Please provide a detailed reason for your leave request..."
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                    rows={5}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific about your reason to help with approval</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 h-11">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setShowLeaveModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${approvalModal.action === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {approvalModal.action === 'approve' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <CardTitle className="text-xl font-bold">
                  Confirm {approvalModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <p className="text-gray-600 mb-6">
                Are you sure you want to <strong>{approvalModal.action}</strong> this leave request? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleApprovalAction}
                  className={`flex-1 h-11 ${approvalModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {approvalModal.action === 'approve' ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Yes, Approve</>
                  ) : (
                    <><XCircle className="h-4 w-4 mr-2" /> Yes, Reject</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-11"
                  onClick={() => setApprovalModal(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
