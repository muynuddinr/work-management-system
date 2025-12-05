import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined. Please set it in your .env file.');
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Common types for safer typing
type Params = Record<string, unknown> | undefined;
type RequestBody = unknown;

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: RequestBody) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
  
  updateDetails: (data: RequestBody) =>
    api.put('/auth/updatedetails', data),
  
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/updatepassword', { currentPassword, newPassword }),
};

// User API
export const userAPI = {
  getUsers: (params?: Params) =>
    api.get('/users', { params }),
  
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  
  createUser: (data: RequestBody) =>
    api.post('/users', data),
  
  updateUser: (id: string, data: RequestBody) =>
    api.put(`/users/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  getInterns: () =>
    api.get('/users/interns'),
  
  uploadAvatar: (id: string, formData: FormData) =>
    api.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Attendance API
export const attendanceAPI = {
  checkIn: () =>
    api.post('/attendance/checkin'),
  
  checkOut: () =>
    api.put('/attendance/checkout'),
  
  getAttendance: (params?: Params) =>
    api.get('/attendance', { params }),
  
  requestLeave: (data: RequestBody) =>
    api.post('/attendance/leave', data),
  
  approveLeave: (id: string, approved: boolean) =>
    api.put(`/attendance/leave/${id}`, { approved }),
  
  getStats: (userId?: string) =>
    api.get(`/attendance/stats/${userId || ''}`),
};

// Task API
export const taskAPI = {
  getTasks: (params?: Params) =>
    api.get('/tasks', { params }),
  
  getTask: (id: string) =>
    api.get(`/tasks/${id}`),
  
  createTask: (data: RequestBody) =>
    api.post('/tasks', data),
  
  updateTask: (id: string, data: RequestBody) =>
    api.put(`/tasks/${id}`, data),
  
  deleteTask: (id: string) =>
    api.delete(`/tasks/${id}`),
  
  addComment: (id: string, comment: string) =>
    api.post(`/tasks/${id}/comments`, { comment }),
  
  getStats: (userId?: string) =>
    api.get(`/tasks/stats/${userId || ''}`),
};

// Work Log API
export const workLogAPI = {
  getWorkLogs: (params?: Params) =>
    api.get('/worklogs', { params }),
  
  getWorkLog: (id: string) =>
    api.get(`/worklogs/${id}`),
  
  createWorkLog: (data: RequestBody) =>
    api.post('/worklogs', data),
  
  updateWorkLog: (id: string, data: RequestBody) =>
    api.put(`/worklogs/${id}`, data),
  
  deleteWorkLog: (id: string) =>
    api.delete(`/worklogs/${id}`),
  
  addFeedback: (id: string, data: RequestBody) =>
    api.put(`/worklogs/${id}/feedback`, data),
};

// Evaluation API
export const evaluationAPI = {
  getEvaluations: (params?: Params) =>
    api.get('/evaluations', { params }),
  
  getEvaluation: (id: string) =>
    api.get(`/evaluations/${id}`),
  
  createEvaluation: (data: RequestBody) =>
    api.post('/evaluations', data),
  
  updateEvaluation: (id: string, data: RequestBody) =>
    api.put(`/evaluations/${id}`, data),
  
  deleteEvaluation: (id: string) =>
    api.delete(`/evaluations/${id}`),
  
  publishEvaluation: (id: string) =>
    api.put(`/evaluations/${id}/publish`),
};

// Message API
export const messageAPI = {
  getMessages: (params?: Params) =>
    api.get('/messages', { params }),
  
  sendMessage: (data: RequestBody) =>
    api.post('/messages', data),
  
  markAsRead: (id: string) =>
    api.put(`/messages/${id}/read`),
  
  getConversations: () =>
    api.get('/messages/conversations'),
};

// Announcement API
export const announcementAPI = {
  getAnnouncements: () =>
    api.get('/announcements'),
  
  createAnnouncement: (data: RequestBody) =>
    api.post('/announcements', data),
  
  markAsRead: (id: string) =>
    api.put(`/announcements/${id}/read`),
};

// Document API
export const documentAPI = {
  getDocuments: (params?: Params) =>
    api.get('/documents', { params }),
  
  getDocument: (id: string) =>
    api.get(`/documents/${id}`),
  
  uploadDocument: (data: FormData) =>
    api.post('/documents', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateDocument: (id: string, data: RequestBody) =>
    api.put(`/documents/${id}`, data),
  
  deleteDocument: (id: string) =>
    api.delete(`/documents/${id}`),
  
  incrementDownload: (id: string) =>
    api.put(`/documents/${id}/download`),
  
  getDownloadUrl: (id: string) =>
    `${API_URL}/documents/${id}/file`,
};

// Notification API
export const notificationAPI = {
  getNotifications: (params?: Params) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getAdminDashboard: () =>
    api.get('/dashboard/admin'),
  
  getInternDashboard: () =>
    api.get('/dashboard/intern'),
};
