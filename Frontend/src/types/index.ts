export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'intern';
  internId?: string; // Unique intern ID (e.g., INT25-0001)
  phone?: string;
  avatar?: string;
  college?: string;
  department?: string;
  internshipRole?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'active' | 'inactive' | 'completed';
  supervisorId?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendance {
  _id: string;
  userId: string | User;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  leaveType?: 'sick' | 'casual' | 'emergency';
  leaveReason?: string;
  leaveApproved?: boolean;
  approvedBy?: string | User;
  totalHours?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string | User;
  assignedBy: string | User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Date;
  startDate?: Date;
  completedDate?: Date;
  attachments?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  comments?: Array<{
    userId: string | User;
    comment: string;
    createdAt: Date;
  }>;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkLog {
  _id: string;
  userId: string | User;
  date: Date;
  title: string;
  description: string;
  tasksCompleted?: string[] | Task[];
  hoursWorked?: number;
  challenges?: string;
  learnings?: string;
  nextDayPlan?: string;
  attachments?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  status: 'submitted' | 'reviewed' | 'approved';
  feedback?: {
    reviewedBy: string | User;
    comment: string;
    rating: number;
    reviewedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Evaluation {
  _id: string;
  internId: string | User;
  evaluatedBy: string | User;
  evaluationType: 'weekly' | 'monthly' | 'final';
  period: {
    startDate: Date;
    endDate: Date;
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
  overallRating?: number;
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
  certificateGenerated?: boolean;
  certificateUrl?: string;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  _id: string;
  sender: string | User;
  recipient: string | User;
  subject?: string;
  message: string;
  isRead?: boolean;
  readAt?: Date;
  attachments?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  priority?: 'low' | 'normal' | 'high';
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'policy' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  publishedBy: string | User;
  targetAudience: 'all' | 'interns' | 'admins';
  isActive?: boolean;
  expiryDate?: Date;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  readBy?: Array<{
    userId: string | User;
    readAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Document {
  _id: string;
  title: string;
  description?: string;
  category: 'training' | 'policy' | 'project' | 'form' | 'certificate' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: string | User;
  sharedWith?: Array<{
    userId: string | User;
    accessLevel: 'view' | 'download' | 'edit';
  }>;
  isPublic?: boolean;
  tags?: string[];
  downloads?: number;
  expiryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
