'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { workLogAPI } from '@/lib/api';
import { exportToCSV, formatDateForCSV } from '@/lib/csvUtils';
import { 
  FileText, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Calendar,
  Star,
  MessageSquare,
  Filter,
  Search,
  Download,
  TrendingUp,
  Award,
  Target,
  CheckCircle2
} from 'lucide-react';

interface WorkLog {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  user?: { _id: string; name: string; email: string }; // Support both
  date: string;
  hoursWorked: number;
  title?: string;
  description?: string;
  tasks?: string; // Legacy field
  learnings?: string;
  feedback?: {
    comment?: string;
    rating?: number;
    reviewedBy?: { _id: string; name: string; email: string };
    reviewedAt?: string;
  };
  rating?: number; // Legacy field
  createdAt: string;
}

export default function WorkLogsPage() {
  const { user: currentUser } = useAuth();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [feedbackLog, setFeedbackLog] = useState<WorkLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    title: '',
    description: '',
    learnings: '',
  });
  const [feedbackData, setFeedbackData] = useState({
    feedback: '',
    rating: 5,
  });

  useEffect(() => {
    loadWorkLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [workLogs, searchTerm, filterRating, dateRange, sortBy]);

  const loadWorkLogs = async () => {
    try {
      const res = await workLogAPI.getWorkLogs();
      setWorkLogs(res.data.data || []);
    } catch (error) {
      console.error('Failed to load work logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...workLogs];

    if (searchTerm) {
      filtered = filtered.filter(log => {
        const userObj = log.userId || log.user;
        return (log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.tasks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.learnings?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userObj?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(log => (log.feedback?.rating || log.rating) === rating);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(log => new Date(log.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(log => new Date(log.date) <= new Date(dateRange.end));
    }

    // Sort logs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'hours-high':
          return b.hoursWorked - a.hoursWorked;
        case 'hours-low':
          return a.hoursWorked - b.hoursWorked;
        case 'rating-high':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-low':
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredLogs(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLog) {
        await workLogAPI.updateWorkLog(editingLog._id, formData);
        alert('✅ Work log updated successfully!');
      } else {
        await workLogAPI.createWorkLog(formData);
        alert('✅ Work log created successfully!');
      }
      closeModal();
      loadWorkLogs();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to save work log'));
    }
  };

  const handleProvideFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackLog) return;
    try {
      await workLogAPI.addFeedback(feedbackLog._id, feedbackData);
      setShowFeedbackModal(false);
      setFeedbackLog(null);
      setFeedbackData({ feedback: '', rating: 5 });
      loadWorkLogs();
      alert('✅ Feedback provided successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to provide feedback'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this work log? This action cannot be undone.')) return;
    try {
      await workLogAPI.deleteWorkLog(id);
      loadWorkLogs();
      alert('✅ Work log deleted successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to delete work log'));
    }
  };

  const openEditModal = (log: WorkLog) => {
    setEditingLog(log);
    setFormData({
      date: new Date(log.date).toISOString().split('T')[0],
      hoursWorked: log.hoursWorked.toString(),
      title: log.title || log.tasks || '', // Support both old and new format
      description: log.description || log.tasks || '', // Support both old and new format
      learnings: log.learnings || '',
    });
    setShowModal(true);
  };

  const openFeedbackModal = (log: WorkLog) => {
    setFeedbackLog(log);
    setFeedbackData({
      feedback: log.feedback?.comment || '',
      rating: log.feedback?.rating || log.rating || 5,
    });
    setShowFeedbackModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLog(null);
    setFormData({ date: new Date().toISOString().split('T')[0], hoursWorked: '', title: '', description: '', learnings: '' });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Hours Worked', 'Title', 'Tasks Completed', 'Learnings', 'Rating', 'Feedback Comment', 'Reviewed By'];
    const csvData = filteredLogs.map(log => {
      const userObj = log.userId || log.user;
      const userName = (userObj && typeof userObj === 'object') ? userObj.name || '' : '';
      const userEmail = (userObj && typeof userObj === 'object') ? userObj.email || '' : '';
      const reviewedByName = (log.feedback?.reviewedBy && typeof log.feedback.reviewedBy === 'object') ? log.feedback.reviewedBy.name || '' : '';
      
      return [
        formatDateForCSV(log.date),
        userName,
        userEmail,
        log.hoursWorked?.toString() || '',
        log.title || '',
        log.description || log.tasks || '',
        log.learnings || '',
        log.feedback?.rating?.toString() || log.rating?.toString() || '',
        log.feedback?.comment || '',
        reviewedByName
      ];
    });

    const filename = `worklogs_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, csvData);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRating('all');
    setDateRange({ start: '', end: '' });
    setSortBy('newest');
  };

  const stats = {
    total: workLogs.length,
    myLogs: workLogs.filter(log => {
      const userObj = log.userId || log.user;
      return userObj?._id === currentUser?._id;
    }).length,
    totalHours: workLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0),
    avgHours: workLogs.length > 0 
      ? (workLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0) / workLogs.length).toFixed(1)
      : '0',
    avgRating: workLogs.filter(log => log.feedback?.rating || log.rating).length > 0
      ? (workLogs.reduce((sum, log) => sum + (log.feedback?.rating || log.rating || 0), 0) / 
         workLogs.filter(log => log.feedback?.rating || log.rating).length).toFixed(1)
      : '—',
    withFeedback: workLogs.filter(log => log.feedback?.comment).length,
    pending: workLogs.filter(log => !log.feedback?.comment && !log.feedback?.rating).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading work logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Work Logs
          </h1>
          <p className="text-muted-foreground mt-2">Track daily work, tasks completed, and receive feedback</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          {currentUser?.role === 'intern' && (
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Add Work Log
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours</p>
                <p className="text-2xl font-bold text-green-600">{stats.avgHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Feedback</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.withFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5 mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search tasks, learnings, or names..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="hours-high">⏰ Hours: High to Low</option>
              <option value="hours-low">⏰ Hours: Low to High</option>
              <option value="rating-high">⭐ Rating: High to Low</option>
              <option value="rating-low">⭐ Rating: Low to High</option>
            </select>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From Date</label>
              <Input
                type="date"
                className="bg-white h-10"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To Date</label>
              <Input
                type="date"
                className="bg-white h-10"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span><strong>{filteredLogs.length}</strong> of <strong>{workLogs.length}</strong> logs displayed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Logs List */}
      <div className="grid gap-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {(log.userId || log.user)?.name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(log.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {log.hoursWorked}h
                          </span>
                          {(log.feedback?.rating || log.rating) && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < (log.feedback?.rating || log.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentUser?.role === 'admin' && !log.feedback?.comment && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openFeedbackModal(log)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Provide Feedback
                          </Button>
                        )}
                        {(currentUser?.role === 'admin' || (log.userId || log.user)?._id === currentUser?._id) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(log)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(log._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          {log.title ? 'Title:' : 'Tasks Completed:'}
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {log.title || log.description || log.tasks || '—'}
                        </p>
                      </div>
                      {log.description && log.title && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">Description:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.description}</p>
                        </div>
                      )}
                      {log.learnings && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">Learnings:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.learnings}</p>
                        </div>
                      )}
                      {log.feedback?.comment && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Admin Feedback:
                          </h4>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{log.feedback.comment}</p>
                        </div>
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
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No work logs yet</p>
              <p className="text-sm text-gray-400">
                {currentUser?.role === 'intern'
                  ? 'Start tracking your daily work by creating your first log'
                  : 'Work logs from interns will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Work Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {editingLog ? 'Edit Work Log' : 'Add Work Log'}
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Date *</label>
                    <Input
                      required
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Hours Worked *</label>
                    <Input
                      required
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="e.g., 8"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                      className="bg-white h-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Title *</label>
                  <Input
                    required
                    placeholder="Brief summary of today's work..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Description *</label>
                  <Textarea
                    required
                    placeholder="Describe what you worked on today in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific about your accomplishments</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Key Learnings (optional)</label>
                  <Textarea
                    placeholder="What did you learn today? Any new skills or insights gained..."
                    value={formData.learnings}
                    onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                    rows={3}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Document your growth and knowledge gains</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 h-11">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {editingLog ? 'Update' : 'Create'} Log
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 h-11" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Provide Feedback</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowFeedbackModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {(feedbackLog.userId || feedbackLog.user)?.name || 'Unknown'}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(feedbackLog.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {feedbackLog.hoursWorked}h
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                      {feedbackLog.title || feedbackLog.description || feedbackLog.tasks || '—'}
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleProvideFeedback} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Rating *</label>
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, rating })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 cursor-pointer transition-colors ${
                            rating <= feedbackData.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-bold text-gray-700">{feedbackData.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click on stars to rate the work quality</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Feedback *</label>
                  <Textarea
                    required
                    placeholder="Provide constructive feedback on the work done. Be specific about what was done well and areas for improvement..."
                    value={feedbackData.feedback}
                    onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                    rows={6}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide actionable feedback to help them grow</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 h-11">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
