'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { messageAPI, announcementAPI, userAPI } from '@/lib/api';
import { exportToCSV, formatDateForCSV, formatDateTimeForCSV } from '@/lib/csvUtils';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  X,
  Megaphone,
  User,
  Clock,
  Search,
  Filter,
  Download,
  Mail,
  MailOpen,
  AlertCircle,
  Bell,
  Users,
  Trash2,
  Eye,
  Archive
} from 'lucide-react';

interface Message {
  _id: string;
  sender: { _id: string; name: string; email: string };
  recipient: { _id: string; name: string; email: string };
  subject: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high';
  conversationId?: string;
  attachments?: Array<{ name: string; url: string; uploadedAt: string }>;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'policy' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  publishedBy: { _id: string; name: string };
  targetAudience: 'all' | 'employees' | 'admins';
  isActive: boolean;
  expiryDate?: string;
  readBy: Array<{ userId: string; readAt: string }>;
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [viewMessageModal, setViewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [messageFormData, setMessageFormData] = useState({
    recipientId: '',
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'urgent' | 'event' | 'policy' | 'achievement',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: 'all' as 'all' | 'employees' | 'admins',
  });

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, filterRead, filterPriority, sortBy]);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, filterType, sortBy]);

  const loadData = async () => {
    try {
      const [messagesRes, announcementsRes] = await Promise.all([
        messageAPI.getMessages(),
        announcementAPI.getAnnouncements(),
      ]);
      setMessages(messagesRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userAPI.getUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRead !== 'all') {
      const isRead = filterRead === 'read';
      filtered = filtered.filter(msg => msg.isRead === isRead);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(msg => msg.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
  };

  const filterAnnouncements = () => {
    let filtered = [...announcements];

    if (searchTerm) {
      filtered = filtered.filter(ann =>
        ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(ann => ann.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    setFilteredAnnouncements(filtered);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (bulkMode && selectedRecipients.length > 0) {
        // Send to multiple recipients
        const promises = selectedRecipients.map(recipientId =>
          messageAPI.sendMessage({
            recipient: recipientId,
            subject: messageFormData.subject,
            message: messageFormData.message,
            priority: messageFormData.priority,
          })
        );
        await Promise.all(promises);
        alert(`Message sent to ${selectedRecipients.length} recipient(s) successfully!`);
      } else if (!bulkMode && messageFormData.recipientId) {
        // Send to single recipient
        await messageAPI.sendMessage({
          recipient: messageFormData.recipientId,
          subject: messageFormData.subject,
          message: messageFormData.message,
          priority: messageFormData.priority,
        });
      } else {
        alert('Please select at least one recipient');
        return;
      }
      
      setShowMessageModal(false);
      setMessageFormData({ recipientId: '', subject: '', message: '', priority: 'normal' });
      setSelectedRecipients([]);
      setBulkMode(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const allUserIds = users.filter(u => u._id !== currentUser?._id).map(u => u._id);
    if (selectedRecipients.length === allUserIds.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(allUserIds);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await announcementAPI.createAnnouncement(announcementFormData);
      setShowAnnouncementModal(false);
      setAnnouncementFormData({ 
        title: '', 
        content: '', 
        type: 'general', 
        priority: 'medium',
        targetAudience: 'all'
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await messageAPI.markAsRead(id);
      loadData();
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'messages') {
      const headers = [
        'From',
        'From Email',
        'To',
        'To Email',
        'Subject',
        'Message',
        'Priority',
        'Status',
        'Date'
      ];

      const csvData = filteredMessages.map(msg => {
        const senderName = (msg.sender && typeof msg.sender === 'object') ? msg.sender.name || '' : '';
        const senderEmail = (msg.sender && typeof msg.sender === 'object') ? msg.sender.email || '' : '';
        const recipientName = (msg.recipient && typeof msg.recipient === 'object') ? msg.recipient.name || '' : '';
        const recipientEmail = (msg.recipient && typeof msg.recipient === 'object') ? msg.recipient.email || '' : '';
        
        return [
          senderName,
          senderEmail,
          recipientName,
          recipientEmail,
          msg.subject || '',
          msg.message || '',
          msg.priority || '',
          msg.isRead ? 'Read' : 'Unread',
          formatDateTimeForCSV(msg.createdAt)
        ];
      });

      const filename = `messages_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filename, headers, csvData);
    } else {
      const headers = [
        'Title',
        'Content',
        'Type',
        'Priority',
        'Target Audience',
        'Published By',
        'Date'
      ];

      const csvData = filteredAnnouncements.map(ann => {
        const publishedByName = (ann.publishedBy && typeof ann.publishedBy === 'object') ? ann.publishedBy.name || '' : '';
        
        return [
          ann.title || '',
          ann.content || '',
          ann.type || '',
          ann.priority || '',
          ann.targetAudience || '',
          publishedByName,
          formatDateTimeForCSV(ann.createdAt)
        ];
      });

      const filename = `announcements_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filename, headers, csvData);
    }
  };

  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter(msg => !msg.isRead && msg.recipient._id === currentUser?._id).length,
    sentMessages: messages.filter(msg => msg.sender._id === currentUser?._id).length,
    receivedMessages: messages.filter(msg => msg.recipient._id === currentUser?._id).length,
    totalAnnouncements: announcements.length,
    unreadAnnouncements: announcements.filter(ann => 
      !ann.readBy.some(r => r.userId === currentUser?._id)
    ).length,
    urgentAnnouncements: announcements.filter(ann => ann.type === 'urgent').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Communication Center
          </h1>
          <p className="text-muted-foreground mt-2">Messages and announcements</p>
        </div>
        <div className="flex items-center gap-2">
          {(filteredMessages.length > 0 || filteredAnnouncements.length > 0) && (
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          <Button onClick={() => setShowMessageModal(true)} className="gap-2">
            <Send className="h-5 w-5" />
            New Message
          </Button>
          {currentUser?.role === 'admin' && (
            <Button onClick={() => setShowAnnouncementModal(true)} className="gap-2" variant="outline">
              <Megaphone className="h-5 w-5" />
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">messages</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">new</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.sentMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">messages</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MailOpen className="h-4 w-4" />
              Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.receivedMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">messages</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground mt-1">total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.urgentAnnouncements}</div>
            <p className="text-xs text-muted-foreground mt-1">items</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setActiveTab('messages')}
          variant={activeTab === 'messages' ? 'default' : 'outline'}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Messages ({stats.unreadMessages > 0 && <span className="font-bold text-orange-600">{stats.unreadMessages}</span>})
        </Button>
        <Button
          onClick={() => setActiveTab('announcements')}
          variant={activeTab === 'announcements' ? 'default' : 'outline'}
          className="gap-2"
        >
          <Megaphone className="h-4 w-4" />
          Announcements ({stats.unreadAnnouncements})
        </Button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <>
          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                >
                  <option value="all">All Messages</option>
                  <option value="false">Unread</option>
                  <option value="true">Read</option>
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">By Priority</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredMessages.length} messages</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="grid gap-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <Card 
                  key={msg._id} 
                  className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    !msg.isRead && msg.recipient._id === currentUser?._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    if (!msg.isRead && msg.recipient._id === currentUser?._id) {
                      handleMarkAsRead(msg._id);
                    }
                    setSelectedMessage(msg);
                    setViewMessageModal(true);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        !msg.isRead && msg.recipient._id === currentUser?._id ? 'bg-blue-200' : 'bg-gray-100'
                      }`}>
                        {!msg.isRead && msg.recipient._id === currentUser?._id ? (
                          <Mail className="h-6 w-6 text-blue-600" />
                        ) : (
                          <MailOpen className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{msg.subject}</h3>
                              {msg.priority === 'high' && (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  High Priority
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                From: {msg.sender?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                To: {msg.recipient?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!msg.isRead && msg.recipient._id === currentUser?._id && (
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Unread</Badge>
                            )}
                            {msg.sender._id === currentUser?._id && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sent</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No messages</p>
                  <p className="text-sm text-gray-400">Start a conversation by sending a message</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <>
          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search announcements..."
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
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event</option>
                  <option value="policy">Policy</option>
                  <option value="achievement">Achievement</option>
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">By Priority</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredAnnouncements.length} announcements</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => {
                const isRead = announcement.readBy.some(r => r.userId === currentUser?._id);
                return (
                  <Card 
                    key={announcement._id} 
                    className={`border-0 shadow-md hover:shadow-lg transition-shadow ${
                      !isRead ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          announcement.type === 'urgent' ? 'bg-red-100' :
                          announcement.type === 'event' ? 'bg-blue-100' :
                          announcement.type === 'achievement' ? 'bg-yellow-100' :
                          announcement.type === 'policy' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          <Megaphone className={`h-6 w-6 ${
                            announcement.type === 'urgent' ? 'text-red-600' :
                            announcement.type === 'event' ? 'text-blue-600' :
                            announcement.type === 'achievement' ? 'text-yellow-600' :
                            announcement.type === 'policy' ? 'text-purple-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                                <Badge className={
                                  announcement.type === 'urgent' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                  announcement.type === 'event' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                  announcement.type === 'achievement' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                  announcement.type === 'policy' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                                  'bg-green-100 text-green-700 hover:bg-green-100'
                                }>
                                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                </Badge>
                                {announcement.priority === 'high' && (
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                                    High Priority
                                  </Badge>
                                )}
                                {!isRead && (
                                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                    <Bell className="h-3 w-3 mr-1" />
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  By {announcement.publishedBy?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {announcement.targetAudience === 'all' ? 'Everyone' : announcement.targetAudience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(announcement.createdAt).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {announcement.readBy.length} views
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3">{announcement.content}</p>
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
                    <Megaphone className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No announcements</p>
                  <p className="text-sm text-gray-400">
                    {currentUser?.role === 'admin'
                      ? 'Create your first announcement to communicate with everyone'
                      : 'Announcements from admins will appear here'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* New Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <CardHeader className="border-b bg-white shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">New Message</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowMessageModal(false);
                  setBulkMode(false);
                  setSelectedRecipients([]);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white overflow-y-auto">
              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkMode}
                      onChange={(e) => {
                        setBulkMode(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedRecipients([]);
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-blue-900">
                      <Users className="h-4 w-4 inline mr-1" />
                      Send to Multiple Recipients
                    </span>
                  </label>
                  {bulkMode && selectedRecipients.length > 0 && (
                    <Badge className="bg-blue-600 text-white">
                      {selectedRecipients.length} selected
                    </Badge>
                  )}
                </div>

                {/* Recipients */}
                {bulkMode ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Select Recipients *</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs"
                      >
                        {selectedRecipients.length === users.filter(u => u._id !== currentUser?._id).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                      {users.filter(u => u._id !== currentUser?._id).map(user => (
                        <label
                          key={user._id}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white transition-colors ${
                            selectedRecipients.includes(user._id) ? 'bg-blue-100 border border-blue-300' : 'bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(user._id)}
                            onChange={() => toggleRecipient(user._id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Recipient *</label>
                    <select
                      required={!bulkMode}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={messageFormData.recipientId}
                      onChange={(e) => setMessageFormData({ ...messageFormData, recipientId: e.target.value })}
                    >
                      <option value="">Select a recipient</option>
                      {users.filter(u => u._id !== currentUser?._id).map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role}) - {u.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Subject *</label>
                    <Input
                      required
                      placeholder="Enter message subject"
                      value={messageFormData.subject}
                      onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={messageFormData.priority}
                      onChange={(e) => setMessageFormData({ ...messageFormData, priority: e.target.value as 'low' | 'normal' | 'high' })}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Message *</label>
                  <Textarea
                    required
                    placeholder="Type your message here..."
                    value={messageFormData.message}
                    onChange={(e) => setMessageFormData({ ...messageFormData, message: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {bulkMode && selectedRecipients.length > 0
                      ? `Send to ${selectedRecipients.length} Recipient(s)`
                      : 'Send Message'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => {
                    setShowMessageModal(false);
                    setBulkMode(false);
                    setSelectedRecipients([]);
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">New Announcement</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowAnnouncementModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Title *</label>
                  <Input
                    required
                    placeholder="Enter announcement title"
                    value={announcementFormData.title}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Type *</label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={announcementFormData.type}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, type: e.target.value as any })}
                    >
                      <option value="general">General</option>
                      <option value="urgent">Urgent</option>
                      <option value="event">Event</option>
                      <option value="policy">Policy</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={announcementFormData.priority}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Audience</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={announcementFormData.targetAudience}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, targetAudience: e.target.value as any })}
                    >
                      <option value="all">Everyone</option>
                      <option value="employees">Employees Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Content *</label>
                  <Textarea
                    required
                    placeholder="Type your announcement here..."
                    value={announcementFormData.content}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                    rows={8}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Megaphone className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAnnouncementModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Message Modal */}
      {viewMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Message Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setViewMessageModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 bg-white">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-semibold">{selectedMessage.sender?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMessage.sender?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-semibold">{selectedMessage.recipient?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMessage.recipient?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge className={
                    selectedMessage.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedMessage.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {selectedMessage.priority.charAt(0).toUpperCase() + selectedMessage.priority.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              {selectedMessage.readAt && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Read on {new Date(selectedMessage.readAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
