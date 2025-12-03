'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { userAPI, dashboardAPI } from '@/lib/api';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X,
  Key,
  TrendingUp,
  CheckSquare,
  Clock,
  Award,
  Upload,
  Camera,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  AlertCircle,
  Building2
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'intern';
  avatar?: string;
  internId?: string; // Unique employee ID
  phone?: string;
  address?: string;
  college?: string;
  department?: string;
  internshipRole?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt: string;
}

interface Stats {
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  totalWorkLogs?: number;
  totalHours?: number;
  averageRating?: number;
  attendanceRate?: number;
}

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    college: '',
    department: '',
    internshipRole: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      if (currentUser?._id) {
        const res = await userAPI.getUser(currentUser._id);
        const userData = res.data.data;
        setProfile(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          college: userData.college || '',
          department: userData.department || '',
          internshipRole: userData.internshipRole || '',
        });
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
      } else if (currentUser) {
        // If no _id, use currentUser directly
        setProfile(currentUser as any);
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: (currentUser as any).phone || '',
          address: (currentUser as any).address || '',
          college: (currentUser as any).college || '',
          department: (currentUser as any).department || '',
          internshipRole: (currentUser as any).internshipRole || '',
        });
        if ((currentUser as any).avatar) {
          setAvatarPreview((currentUser as any).avatar);
        }
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // If API fails, use currentUser data as fallback
      if (currentUser) {
        setProfile(currentUser as any);
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: (currentUser as any).phone || '',
          address: (currentUser as any).address || '',
          college: (currentUser as any).college || '',
          department: (currentUser as any).department || '',
          internshipRole: (currentUser as any).internshipRole || '',
        });
        if ((currentUser as any).avatar) {
          setAvatarPreview((currentUser as any).avatar);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (currentUser?.role === 'intern') {
        console.log('📋 Loading employee stats...');
        const res = await dashboardAPI.getInternDashboard();
        console.log('✅ Stats loaded:', res.data.data);
        
        const dashboardData = res.data.data || {};
        
        // Map the nested structure to flat structure for easier access
        const mappedStats = {
          totalTasks: dashboardData.tasks?.total || 0,
          completedTasks: dashboardData.tasks?.completed || 0,
          pendingTasks: dashboardData.tasks?.pending || 0,
          totalWorkLogs: dashboardData.workLogs?.total || 0,
          totalHours: dashboardData.workLogs?.totalHours || 0,
          averageRating: dashboardData.workLogs?.averageRating ? parseFloat(dashboardData.workLogs.averageRating) : undefined,
          attendanceRate: dashboardData.attendance?.attendancePercentage ? parseFloat(dashboardData.attendance.attendancePercentage) : undefined,
        };
        
        console.log('📈 Mapped stats:', mappedStats);
        setStats(mappedStats);
      }
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !currentUser) return;

    setUploadingAvatar(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('avatar', avatarFile);
      
      console.log('📤 Uploading avatar for user:', currentUser._id);
      
      // Upload to backend which will handle Cloudinary upload
      const response = await userAPI.uploadAvatar(currentUser._id, uploadFormData);
      
      console.log('✅ Upload response:', response.data);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        console.log('👤 Updated user data:', updatedUser);
        console.log('🖼️ New avatar URL:', updatedUser.avatar);
        
        setProfile(updatedUser);
        setAvatarPreview(updatedUser.avatar);
        setAvatarFile(null);
        
        // Update localStorage
        const userToStore = { ...currentUser, avatar: updatedUser.avatar };
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        alert('Profile picture updated successfully! Page will refresh.');
        
        // Force page reload to show the new avatar everywhere
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) return;
      const res = await userAPI.updateUser(currentUser._id, formData);
      const updatedUser = res.data.data;
      setProfile(updatedUser);
      
      // Update localStorage
      const userToStore = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      setEditing(false);
      
      // Reload profile and stats to ensure all data is fresh
      await Promise.all([loadProfile(), loadStats()]);
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      if (!currentUser) return;
      await userAPI.updateUser(currentUser._id, {
        password: passwordData.newPassword,
      });
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        college: profile.college || '',
        department: profile.department || '',
        internshipRole: profile.internshipRole || '',
      });
    }
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account and view your statistics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              {!editing && !changingPassword && (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 border-2 border-blue-500">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Profile Picture</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (Max 5MB)</p>
                    {avatarFile && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-green-600 font-medium">✓ Image selected: {avatarFile.name}</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUploadAvatar}
                          disabled={uploadingAvatar}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload Photo Now'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Address</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                    rows={2}
                  />
                </div>

                {/* Employee-specific fields */}
                {currentUser?.role === 'intern' && (
                  <>
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Employment Details</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">College/University</label>
                          <Input
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            placeholder="Your college name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Department</label>
                          <Input
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Employment Role</label>
                          <Input
                            value={formData.internshipRole}
                            onChange={(e) => setFormData({ ...formData, internshipRole: e.target.value })}
                            placeholder="e.g., Software Developer"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : changingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-900">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Choose a strong password with at least 6 characters
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Current Password *</label>
                  <Input
                    required
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">New Password *</label>
                  <Input
                    required
                    type="password"
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm New Password *</label>
                  <Input
                    required
                    type="password"
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Role</p>
                      <Badge className={profile.role === 'admin' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 mt-1' : 'bg-blue-100 text-blue-700 hover:bg-blue-100 mt-1'}>
                        {profile.role === 'admin' ? 'Administrator' : 'Employee'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Member Since</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {profile.phone && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-900 mt-1">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-900 mt-1">{profile.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Employee Details */}
                {currentUser?.role === 'intern' && (profile.college || profile.department || profile.internshipRole) && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Employment Details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {profile.college && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">College</p>
                            <p className="text-sm text-gray-900 mt-1">{profile.college}</p>
                          </div>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Department</p>
                            <p className="text-sm text-gray-900 mt-1">{profile.department}</p>
                          </div>
                        </div>
                      )}
                      {profile.internshipRole && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <Briefcase className="h-5 w-5 text-teal-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Role</p>
                            <p className="text-sm text-gray-900 mt-1">{profile.internshipRole}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <Button onClick={() => setChangingPassword(true)} variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Link href="/forgot-password" className="block">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Forgot Password
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg bg-linear-to-br from-indigo-50 to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-indigo-700">Registration No.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-indigo-900">{profile.internId || profile._id}</p>
              <p className="text-xs text-indigo-600 mt-2">{profile.internId ? 'Your unique identifier' : 'System ID'}</p>
            </CardContent>
          </Card>

          {profile.status && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={
                  profile.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                  profile.status === 'completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                  'bg-gray-100 text-gray-700 hover:bg-gray-100'
                }>
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>
          )}

          {currentUser?.role === 'intern' && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    {stats.completedTasks || 0}/{stats.totalTasks || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hours Logged</span>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {stats.totalHours || 0}h
                  </Badge>
                </div>
                {stats.averageRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Rating</span>
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      ⭐ {stats.averageRating.toFixed(1)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Performance Overview (For Employees) */}
      {currentUser?.role === 'intern' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedTasks || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Work Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalHours || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalWorkLogs || 0} work logs
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average rating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.attendanceRate ? `${stats.attendanceRate.toFixed(0)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Attendance rate</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
