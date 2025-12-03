'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { evaluationAPI, userAPI } from '@/lib/api';
import { exportToCSV, formatDateForCSV } from '@/lib/csvUtils';
import { 
  Award, 
  User, 
  Plus, 
  X,
  Calendar,
  Star,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Target,
  CheckCircle2,
  BarChart
} from 'lucide-react';

interface Evaluation {
  _id: string;
  internId: { _id: string; name: string; email: string };
  evaluatedBy: { _id: string; name: string; email: string };
  evaluationType: 'weekly' | 'monthly' | 'final';
  period: {
    startDate: string;
    endDate: string;
  };
  ratings: {
    technicalSkills: number;
    communication: number;
    teamwork: number;
    punctuality: number;
    problemSolving: number;
    initiative: number;
    learningAbility: number;
  };
  overallRating: number;
  strengths: string;
  areasOfImprovement: string;
  achievements?: string;
  recommendations?: string;
  stats?: {
    tasksCompleted: number;
    tasksAssigned: number;
    attendancePercentage: number;
    averageHoursPerDay: number;
  };
  isPublished: boolean;
  certificateGenerated?: boolean;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function EvaluationsPage() {
  const { user: currentUser } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvals, setFilteredEvals] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState({
    internId: '',
    evaluationType: 'monthly' as 'weekly' | 'monthly' | 'final',
    period: {
      startDate: '',
      endDate: '',
    },
    ratings: {
      technicalSkills: 3,
      communication: 3,
      teamwork: 3,
      punctuality: 3,
      problemSolving: 3,
      initiative: 3,
      learningAbility: 3,
    },
    strengths: '',
    areasOfImprovement: '',
    achievements: '',
    recommendations: '',
    stats: {
      tasksCompleted: 0,
      tasksAssigned: 0,
      attendancePercentage: 0,
      averageHoursPerDay: 0,
    },
  });

  useEffect(() => {
    loadEvaluations();
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    filterEvaluations();
  }, [evaluations, searchTerm, filterRating, filterType, filterStatus, sortBy]);

  const loadEvaluations = async () => {
    try {
      const res = await evaluationAPI.getEvaluations();
      setEvaluations(res.data.data || []);
    } catch (error) {
      console.error('Failed to load evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userAPI.getUsers();
      const employees = (res.data.data || []).filter((u: UserOption) => u.role === 'intern');
      setUsers(employees);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filterEvaluations = () => {
    let filtered = [...evaluations];

    if (searchTerm) {
      filtered = filtered.filter(ev =>
        ev.internId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evaluationType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRating !== 'all') {
      const minRating = parseInt(filterRating);
      filtered = filtered.filter(ev => Math.floor(ev.overallRating) === minRating);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(ev => ev.evaluationType === filterType);
    }

    if (filterStatus !== 'all') {
      const isPublished = filterStatus === 'published';
      filtered = filtered.filter(ev => ev.isPublished === isPublished);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating-high':
          return b.overallRating - a.overallRating;
        case 'rating-low':
          return a.overallRating - b.overallRating;
        case 'name':
          return (a.internId?.name || '').localeCompare(b.internId?.name || '');
        default:
          return 0;
      }
    });

    setFilteredEvals(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evaluationAPI.createEvaluation(formData);
      closeModal();
      loadEvaluations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create evaluation');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await evaluationAPI.publishEvaluation(id);
      loadEvaluations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to publish evaluation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    try {
      await evaluationAPI.deleteEvaluation(id);
      loadEvaluations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete evaluation');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      internId: '',
      evaluationType: 'monthly',
      period: {
        startDate: '',
        endDate: '',
      },
      ratings: {
        technicalSkills: 3,
        communication: 3,
        teamwork: 3,
        punctuality: 3,
        problemSolving: 3,
        initiative: 3,
        learningAbility: 3,
      },
      strengths: '',
      areasOfImprovement: '',
      achievements: '',
      recommendations: '',
      stats: {
        tasksCompleted: 0,
        tasksAssigned: 0,
        attendancePercentage: 0,
        averageHoursPerDay: 0,
      },
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Employee Name',
      'Employee Email',
      'Evaluation Type',
      'Period Start',
      'Period End',
      'Overall Rating',
      'Technical Skills',
      'Communication',
      'Teamwork',
      'Punctuality',
      'Problem Solving',
      'Initiative',
      'Learning Ability',
      'Strengths',
      'Areas for Improvement',
      'Status',
      'Evaluated By',
      'Created At'
    ];

    const csvData = filteredEvals.map(ev => {
      const employeeName = (ev.internId && typeof ev.internId === 'object') ? ev.internId.name || '' : '';
      const employeeEmail = (ev.internId && typeof ev.internId === 'object') ? ev.internId.email || '' : '';
      const evaluatedByName = (ev.evaluatedBy && typeof ev.evaluatedBy === 'object') ? ev.evaluatedBy.name || '' : '';
      
      return [
        employeeName,
        employeeEmail,
        ev.evaluationType || '',
        formatDateForCSV(ev.period?.startDate),
        formatDateForCSV(ev.period?.endDate),
        ev.overallRating?.toFixed(1) || '',
        ev.ratings?.technicalSkills?.toString() || '',
        ev.ratings?.communication?.toString() || '',
        ev.ratings?.teamwork?.toString() || '',
        ev.ratings?.punctuality?.toString() || '',
        ev.ratings?.problemSolving?.toString() || '',
        ev.ratings?.initiative?.toString() || '',
        ev.ratings?.learningAbility?.toString() || '',
        ev.strengths || '',
        ev.areasOfImprovement || '',
        ev.isPublished ? 'Published' : 'Draft',
        evaluatedByName,
        formatDateForCSV(ev.createdAt)
      ];
    });

    const filename = `evaluations_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, csvData);
  };

  const stats = {
    total: evaluations.length,
    avgRating: evaluations.length > 0
      ? (evaluations.reduce((sum, ev) => sum + ev.overallRating, 0) / evaluations.length).toFixed(1)
      : '—',
    highPerformers: evaluations.filter(ev => ev.overallRating >= 4.5).length,
    myEvaluations: evaluations.filter(ev => ev.internId?._id === currentUser?._id).length,
    published: evaluations.filter(ev => ev.isPublished).length,
    drafts: evaluations.filter(ev => !ev.isPublished).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading evaluations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Performance Evaluations
          </h1>
          <p className="text-muted-foreground mt-2">Review and track employee performance assessments</p>
        </div>
        <div className="flex items-center gap-3">
          {filteredEvals.length > 0 && (
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          {currentUser?.role === 'admin' && (
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              New Evaluation
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">evaluations</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.highPerformers}</div>
            <p className="text-xs text-muted-foreground mt-1">≥ 4.5 rating</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground mt-1">visible</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground mt-1">not published</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {currentUser?.role === 'intern' ? 'My Reviews' : 'Completion'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {currentUser?.role === 'intern' ? stats.myEvaluations : (users.length > 0 ? `${Math.round((stats.total / users.length) * 100)}%` : '0%')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currentUser?.role === 'intern' ? 'evaluations' : 'coverage'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="final">Final</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredEvals.length} of {evaluations.length} evaluations</span>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <div className="grid gap-4">
        {filteredEvals.length > 0 ? (
          filteredEvals.map((evaluation) => (
            <Card key={evaluation._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{evaluation.internId?.name || 'Unknown'}</h3>
                          <Badge className={
                            evaluation.evaluationType === 'final' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                            evaluation.evaluationType === 'monthly' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                            'bg-green-100 text-green-700 hover:bg-green-100'
                          }>
                            {evaluation.evaluationType.charAt(0).toUpperCase() + evaluation.evaluationType.slice(1)}
                          </Badge>
                          {!evaluation.isPublished && (
                            <Badge variant="outline" className="text-gray-600">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(evaluation.period.startDate).toLocaleDateString()} - {new Date(evaluation.period.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            By {evaluation.evaluatedBy?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-2xl font-bold text-yellow-600">{evaluation.overallRating.toFixed(1)}</span>
                        </div>
                        <Badge className={
                          evaluation.overallRating >= 4.5 ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          evaluation.overallRating >= 3.5 ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                          evaluation.overallRating >= 2.5 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                          'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {evaluation.overallRating >= 4.5 ? 'Excellent' :
                           evaluation.overallRating >= 3.5 ? 'Good' :
                           evaluation.overallRating >= 2.5 ? 'Average' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </div>

                    {/* Skill Ratings Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Technical</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.technicalSkills}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Communication</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.communication}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Teamwork</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.teamwork}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Punctuality</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.punctuality}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Problem Solving</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.problemSolving}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Initiative</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.initiative}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Learning</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{evaluation.ratings.learningAbility}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Sections */}
                    <div className="space-y-3">
                      {evaluation.strengths && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-1">💪 Strengths:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{evaluation.strengths}</p>
                        </div>
                      )}
                      {evaluation.areasOfImprovement && (
                        <div>
                          <h4 className="text-sm font-semibold text-orange-700 mb-1">📈 Areas for Improvement:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{evaluation.areasOfImprovement}</p>
                        </div>
                      )}
                      {evaluation.achievements && (
                        <div>
                          <h4 className="text-sm font-semibold text-blue-700 mb-1">🏆 Achievements:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{evaluation.achievements}</p>
                        </div>
                      )}
                      {evaluation.recommendations && (
                        <div>
                          <h4 className="text-sm font-semibold text-purple-700 mb-1">💡 Recommendations:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{evaluation.recommendations}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats if available */}
                    {evaluation.stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                          <p className="font-semibold">{evaluation.stats.tasksCompleted} / {evaluation.stats.tasksAssigned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                          <p className="font-semibold">{evaluation.stats.attendancePercentage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Avg Hours/Day</p>
                          <p className="font-semibold">{evaluation.stats.averageHoursPerDay.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                          <p className="font-semibold">
                            {evaluation.stats.tasksAssigned > 0 
                              ? Math.round((evaluation.stats.tasksCompleted / evaluation.stats.tasksAssigned) * 100) 
                              : 0}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {currentUser?.role === 'admin' && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        {!evaluation.isPublished && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(evaluation._id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEval(evaluation);
                            setViewModal(true);
                          }}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(evaluation._id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No evaluations found</p>
              <p className="text-sm text-gray-400">
                {currentUser?.role === 'admin'
                  ? 'Create performance evaluations for employees'
                  : 'Your performance evaluations will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Evaluation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl border-0 shadow-2xl my-8 max-h-[90vh] flex flex-col bg-white">
            <CardHeader className="border-b bg-white rounded-t-lg shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">New Performance Evaluation</CardTitle>
                <Button variant="outline" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto flex-1 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Employee *</label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.internId}
                      onChange={(e) => setFormData({ ...formData, internId: e.target.value })}
                    >
                      <option value="">Select an employee</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Evaluation Type *</label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.evaluationType}
                      onChange={(e) => setFormData({ ...formData, evaluationType: e.target.value as 'weekly' | 'monthly' | 'final' })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Period Start Date *</label>
                    <Input
                      required
                      type="date"
                      value={formData.period.startDate}
                      onChange={(e) => setFormData({ ...formData, period: { ...formData.period, startDate: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Period End Date *</label>
                    <Input
                      required
                      type="date"
                      value={formData.period.endDate}
                      onChange={(e) => setFormData({ ...formData, period: { ...formData.period, endDate: e.target.value } })}
                    />
                  </div>
                </div>

                {/* Performance Ratings */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Performance Ratings (1-5)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(Object.keys(formData.ratings) as Array<keyof typeof formData.ratings>).map((key) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-yellow-600 font-semibold">{formData.ratings[key]}/5</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.ratings[key]}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            ratings: { ...formData.ratings, [key]: parseInt(e.target.value) } 
                          })}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Strengths *</label>
                    <Textarea
                      required
                      placeholder="What does this employee do well? Highlight their key strengths..."
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Areas for Improvement *</label>
                    <Textarea
                      required
                      placeholder="What areas need development? Be specific and constructive..."
                      value={formData.areasOfImprovement}
                      onChange={(e) => setFormData({ ...formData, areasOfImprovement: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Achievements (Optional)</label>
                    <Textarea
                      placeholder="Notable accomplishments during this period..."
                      value={formData.achievements}
                      onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Recommendations (Optional)</label>
                    <Textarea
                      placeholder="Suggestions for future development, training, or career path..."
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Statistics (Optional) */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Statistics (Optional)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Tasks Completed</label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.stats.tasksCompleted}
                        onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, tasksCompleted: parseInt(e.target.value) || 0 } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Tasks Assigned</label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.stats.tasksAssigned}
                        onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, tasksAssigned: parseInt(e.target.value) || 0 } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Attendance %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.stats.attendancePercentage}
                        onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, attendancePercentage: parseInt(e.target.value) || 0 } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Avg Hours Per Day</label>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.stats.averageHoursPerDay}
                        onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, averageHoursPerDay: parseFloat(e.target.value) || 0 } })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t mt-4">
                  <Button type="submit" className="flex-1">
                    Create Evaluation
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal && selectedEval && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl border-0 shadow-2xl my-8 max-h-[90vh] flex flex-col bg-white">
            <CardHeader className="border-b bg-white rounded-t-lg shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Evaluation Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 overflow-y-auto flex-1 bg-white">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-semibold">{selectedEval.internId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evaluated By</p>
                  <p className="font-semibold">{selectedEval.evaluatedBy?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold capitalize">{selectedEval.evaluationType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-semibold">
                    {new Date(selectedEval.period.startDate).toLocaleDateString()} - {new Date(selectedEval.period.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <p className="font-semibold text-2xl text-yellow-600">{selectedEval.overallRating.toFixed(1)}/5</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={selectedEval.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {selectedEval.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">All Ratings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedEval.ratings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-semibold">{value}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">💪 Strengths</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedEval.strengths}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">📈 Areas for Improvement</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedEval.areasOfImprovement}</p>
                </div>
                {selectedEval.achievements && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">🏆 Achievements</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedEval.achievements}</p>
                  </div>
                )}
                {selectedEval.recommendations && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">💡 Recommendations</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedEval.recommendations}</p>
                  </div>
                )}
              </div>

              {selectedEval.stats && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Performance Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                      <p className="font-semibold">{selectedEval.stats.tasksCompleted} / {selectedEval.stats.tasksAssigned}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="font-semibold">{selectedEval.stats.attendancePercentage}%</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
                      <p className="font-semibold">{selectedEval.stats.averageHoursPerDay.toFixed(1)}h</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="font-semibold">
                        {selectedEval.stats.tasksAssigned > 0 
                          ? Math.round((selectedEval.stats.tasksCompleted / selectedEval.stats.tasksAssigned) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
