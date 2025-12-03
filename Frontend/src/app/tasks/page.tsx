'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { taskAPI, userAPI } from '@/lib/api';
import { exportToCSV, formatDateForCSV } from '@/lib/csvUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Calendar, User, CheckCircle2, Clock, AlertCircle, Edit, Trash2, X, Download, TrendingUp, ListTodo, Target, Zap } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo?: { _id: string; name: string };
  assignedBy?: { _id: string; name: string };
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data.data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Show user-friendly message
      if (error.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
      } else if (error.response?.status === 400) {
        alert('⚠️ Bad request: ' + (error.response?.data?.message || 'Please check your request'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Try to get interns, fallback to all users if needed
      try {
        const response = await userAPI.getInterns();
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (internError) {
        // Fallback: get all users and filter interns
        const response = await userAPI.getUsers();
        if (response.data.success) {
          const interns = response.data.data.filter((u: any) => u.role === 'intern');
          setUsers(interns);
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Set empty array if both fail
      setUsers([]);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend requires assignedTo and assignedBy
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo, // Required field
      };
      
      await taskAPI.createTask(taskData);
      setShowCreateModal(false);
      resetForm();
      loadTasks();
      alert('✅ Task created successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to create task'));
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      // Backend requires assignedTo and assignedBy
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo, // Required field
      };
      
      await taskAPI.updateTask(editingTask._id, taskData);
      setEditingTask(null);
      resetForm();
      loadTasks();
      alert('✅ Task updated successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to update task'));
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this task? This action cannot be undone.')) return;
    try {
      await taskAPI.deleteTask(id);
      loadTasks();
      alert('✅ Task deleted successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to delete task'));
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await taskAPI.updateTask(id, { status });
      loadTasks();
      alert('✅ Task status updated successfully!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to update status'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 hover:bg-green-100',
      'in-progress': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      pending: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 hover:bg-red-100',
      high: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
      medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
      low: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Description', 'Assigned To', 'Assigned By', 'Status', 'Priority', 'Due Date', 'Created At'];
    const csvData = filteredTasks.map(task => {
      const assignedToName = (task.assignedTo && typeof task.assignedTo === 'object') ? task.assignedTo.name || '' : '';
      const assignedByName = (task.assignedBy && typeof task.assignedBy === 'object') ? task.assignedBy.name || '' : '';
      
      return [
        task.title || '',
        task.description || '',
        assignedToName,
        assignedByName,
        task.status || '',
        task.priority || '',
        formatDateForCSV(task.dueDate),
        formatDateForCSV(task.createdAt)
      ];
    });

    const filename = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, csvData);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('dueDate');
  };

  // Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      new Date(t.dueDate) < new Date()
    ).length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tasks Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage and track all tasks efficiently</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-5 w-5" />
                Create Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">📅 Sort by Due Date</option>
              <option value="priority">⚡ Sort by Priority</option>
              <option value="status">📊 Sort by Status</option>
              <option value="newest">🆕 Sort by Newest</option>
            </select>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span><strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks displayed</span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
            const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={task._id} className={`border-0 shadow-md hover:shadow-lg transition-shadow ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      task.status === 'completed' ? 'bg-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-100' :
                      isOverdue ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          {isOverdue && (
                            <div className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>Overdue by {Math.abs(daysUntilDue)} days</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadge(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityBadge(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {task.assignedTo && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{task.assignedTo.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                            {!isOverdue && daysUntilDue >= 0 && daysUntilDue <= 3 && (
                              <span className="ml-1 text-orange-600 font-medium">({daysUntilDue}d left)</span>
                            )}
                          </span>
                        </div>
                        {task.assignedBy && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>Assigned by: {task.assignedBy.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role === 'intern' && task.status !== 'completed' && (
                        <select
                          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No tasks found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or create a new task</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ListTodo className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Task Title *
                  </label>
                  <Input
                    required
                    placeholder="Enter a clear and concise task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    required
                    placeholder="Provide detailed information about the task, requirements, and expectations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific to help the assignee understand the task better</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Assign To *
                  </label>
                  <select
                    required
                    className="w-full h-11 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="">
                      {users.length === 0 ? '⏳ Loading employees...' : '👤 Select an employee...'}
                    </option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        👤 {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {users.length === 0 
                      ? 'No employees available. Please create employee users first.' 
                      : 'Choose who will be responsible for this task'}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Priority *
                    </label>
                    <select
                      required
                      className="w-full h-11 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">🔵 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🟠 High Priority</option>
                      <option value="urgent">🔴 Urgent Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Due Date *
                    </label>
                    <Input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="bg-white h-11"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 h-11">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTask(null);
                      resetForm();
                    }}
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
