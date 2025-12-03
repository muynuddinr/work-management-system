'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { documentAPI, userAPI } from '@/lib/api';
import { exportToCSV, formatDateTimeForCSV } from '@/lib/csvUtils';
import { 
  FileArchive, 
  Upload, 
  Download, 
  Trash2, 
  X,
  File,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  Eye,
  Lock,
  Unlock,
  Share2,
  Edit,
  AlertCircle,
  FileCheck,
  FolderOpen,
  Clock,
  HardDrive,
  TrendingUp,
  Tag
} from 'lucide-react';

interface Document {
  _id: string;
  title: string;
  description?: string;
  category: 'training' | 'policy' | 'project' | 'form' | 'certificate' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: { _id: string; name: string; email: string };
  sharedWith: Array<{
    userId: { _id: string; name: string };
    accessLevel: 'view' | 'download' | 'edit';
  }>;
  isPublic: boolean;
  tags: string[];
  downloads: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DocumentsPage() {
  const { user: currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as 'training' | 'policy' | 'project' | 'form' | 'certificate' | 'other',
    isPublic: false,
    tags: '',
    expiryDate: '',
    file: null as File | null,
    selectedUsers: [] as string[], // Add selected users array
  });
  const [shareData, setShareData] = useState({
    userId: '',
    accessLevel: 'view' as 'view' | 'download' | 'edit',
  });

  useEffect(() => {
    loadDocuments();
    loadUsers();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterCategory, filterAccess, sortBy]);

  const loadDocuments = async () => {
    try {
      const res = await documentAPI.getDocuments();
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('👥 Loading users for share dropdown...');
      // Only load employees for sharing documents
      const res = await userAPI.getUsers({ role: 'intern', status: 'active' });
      console.log('✅ Users loaded:', res.data.data);
      console.log('   Total users:', res.data.count);
      setUsers(res.data.data || []);
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    if (filterAccess === 'public') {
      filtered = filtered.filter(doc => doc.isPublic);
    } else if (filterAccess === 'private') {
      filtered = filtered.filter(doc => !doc.isPublic);
    } else if (filterAccess === 'myuploads') {
      filtered = filtered.filter(doc => doc.uploadedBy?._id === currentUser?._id);
    } else if (filterAccess === 'shared') {
      filtered = filtered.filter(doc => 
        doc.sharedWith?.some((share: any) => share.userId?._id === currentUser?._id)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'downloads':
          return b.downloads - a.downloads;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

    setFilteredDocs(filtered);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    // Check file size (max 10MB)
    if (formData.file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check if file has content
    if (formData.file.size === 0) {
      alert('Cannot upload empty file');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('isPublic', formData.isPublic.toString());
      uploadFormData.append('tags', formData.tags);
      if (formData.expiryDate) {
        uploadFormData.append('expiryDate', formData.expiryDate);
      }
      
      // Add selected users if not public
      if (!formData.isPublic && formData.selectedUsers.length > 0) {
        const sharedWith = formData.selectedUsers.map(userId => ({
          userId: userId,
          accessLevel: 'view'
        }));
        uploadFormData.append('sharedWith', JSON.stringify(sharedWith));
      }

      console.log('📤 Uploading file:', {
        name: formData.file.name,
        size: formData.file.size,
        type: formData.file.type,
        isPublic: formData.isPublic,
        selectedUsers: formData.selectedUsers.length
      });

      await documentAPI.uploadDocument(uploadFormData);
      closeUploadModal();
      loadDocuments();
      alert('Document uploaded successfully!');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to upload document';
      
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      console.log('📤 Sharing document:', {
        documentId: selectedDoc._id,
        userId: shareData.userId,
        accessLevel: shareData.accessLevel,
        currentSharedWith: selectedDoc.sharedWith
      });
      
      const updatedSharedWith = [
        ...(selectedDoc.sharedWith || []),
        {
          userId: shareData.userId,
          accessLevel: shareData.accessLevel,
        }
      ];

      const response = await documentAPI.updateDocument(selectedDoc._id, {
        sharedWith: updatedSharedWith,
      });

      console.log('✅ Document shared successfully:', response.data);
      setShowShareModal(false);
      setShareData({ userId: '', accessLevel: 'view' });
      loadDocuments();
      alert('Document shared successfully!');
    } catch (error: any) {
      console.error('❌ Failed to share document:', error);
      alert(error.response?.data?.message || 'Failed to share document');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentAPI.incrementDownload(doc._id);
      
      // Get token for authenticated download
      const token = localStorage.getItem('token');
      const downloadUrl = documentAPI.getDownloadUrl(doc._id);
      
      // Create a temporary link with token in query parameter
      const link = document.createElement('a');
      link.href = `${downloadUrl}?token=${token}`;
      link.download = doc.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      loadDocuments();
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleViewDocument = async (doc: Document) => {
    try {
      console.log('👁️ Opening document for view:', doc.title);
      
      // Fetch the document through API with authentication
      const token = localStorage.getItem('token');
      const viewUrl = documentAPI.getDownloadUrl(doc._id);
      
      const response = await fetch(viewUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }

      // Create blob URL and open in new tab
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
      console.log('✅ Document opened successfully');
    } catch (error: any) {
      console.error('❌ Failed to view document:', error);
      alert(error.message || 'Failed to view document. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentAPI.deleteDocument(id);
      loadDocuments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleTogglePublic = async (doc: Document) => {
    try {
      console.log('🔒 Toggling document public status:', {
        id: doc._id,
        currentStatus: doc.isPublic,
        newStatus: !doc.isPublic
      });
      
      const response = await documentAPI.updateDocument(doc._id, {
        isPublic: !doc.isPublic,
      });
      
      console.log('✅ Document status updated:', response.data);
      alert(`Document is now ${!doc.isPublic ? 'public' : 'private'}`);
      loadDocuments();
    } catch (error: any) {
      console.error('❌ Failed to toggle document status:', error);
      alert(error.response?.data?.message || 'Failed to update document');
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setFileInputKey(Date.now()); // Reset file input
    setFormData({ 
      title: '', 
      description: '', 
      category: 'other',
      isPublic: false,
      tags: '',
      expiryDate: '',
      file: null,
      selectedUsers: [],
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon className="h-6 w-6 text-blue-600" />;
    if (fileType.includes('video')) return <FileVideo className="h-6 w-6 text-purple-600" />;
    if (fileType.includes('pdf') || fileType.includes('text')) return <FileText className="h-6 w-6 text-red-600" />;
    return <File className="h-6 w-6 text-gray-600" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'training': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'policy': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'project': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'form': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'certificate': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleExportCSV = () => {
    const headers = [
      'Title',
      'Description',
      'Category',
      'File Type',
      'Size (KB)',
      'Uploaded By',
      'Uploaded By Email',
      'Downloads',
      'Access',
      'Tags',
      'Date'
    ];

    const csvData = filteredDocs.map(doc => {
      const uploadedByName = (doc.uploadedBy && typeof doc.uploadedBy === 'object') ? doc.uploadedBy.name || '' : '';
      const uploadedByEmail = (doc.uploadedBy && typeof doc.uploadedBy === 'object') ? doc.uploadedBy.email || '' : '';
      
      return [
        doc.title || '',
        doc.description || '',
        doc.category || '',
        doc.fileType || '',
        doc.fileSize ? (doc.fileSize / 1024).toFixed(2) : '',
        uploadedByName,
        uploadedByEmail,
        doc.downloads?.toString() || '0',
        doc.isPublic ? 'Public' : 'Private',
        Array.isArray(doc.tags) ? doc.tags.join('; ') : '',
        formatDateTimeForCSV(doc.createdAt)
      ];
    });

    const filename = `documents_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, csvData);
  };

  const stats = {
    total: documents.length,
    myUploads: documents.filter(doc => doc.uploadedBy?._id === currentUser?._id).length,
    public: documents.filter(doc => doc.isPublic).length,
    private: documents.filter(doc => !doc.isPublic).length,
    totalDownloads: documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0),
    totalSize: formatFileSize(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Document Library
          </h1>
          <p className="text-muted-foreground mt-2">Upload, share, and manage documents</p>
        </div>
        <div className="flex items-center gap-2">
          {filteredDocs.length > 0 && (
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          {currentUser?.role === 'admin' && (
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">documents</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" />
              My Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.myUploads}</div>
            <p className="text-xs text-muted-foreground mt-1">by me</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Public
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.public}</div>
            <p className="text-xs text-muted-foreground mt-1">accessible</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.private}</div>
            <p className="text-xs text-muted-foreground mt-1">restricted</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground mt-1">total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalSize}</div>
            <p className="text-xs text-muted-foreground mt-1">used</p>
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
                placeholder="Search documents, tags..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="training">Training</option>
              <option value="policy">Policy</option>
              <option value="project">Project</option>
              <option value="form">Form</option>
              <option value="certificate">Certificate</option>
              <option value="other">Other</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
            >
              <option value="all">All Documents</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="myuploads">My Uploads</option>
              <option value="shared">Shared with Me</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloads</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Largest Size</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredDocs.length} docs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <Card key={doc._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-gray-100">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(doc.fileSize)} • {doc.downloads} downloads
                      </p>
                    </div>
                    {doc.isPublic ? (
                      <Unlock className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getCategoryColor(doc.category)}>
                      {doc.category}
                    </Badge>
                    {doc.tags && doc.tags.length > 0 && (
                      <>
                        {doc.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 2}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <User className="h-3 w-3" />
                    <span>{doc.uploadedBy?.name}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>

                  {doc.sharedWith && doc.sharedWith.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Users className="h-3 w-3" />
                      <span>Shared with {doc.sharedWith.length} user(s)</span>
                    </div>
                  )}

                  {doc.expiryDate && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 gap-1 min-w-[100px]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(doc)}
                      title="Open in new tab"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(currentUser?.role === 'admin' || doc.uploadedBy?._id === currentUser?._id) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setShowShareModal(true);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublic(doc)}
                          title={doc.isPublic ? 'Make Private' : 'Make Public'}
                        >
                          {doc.isPublic ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md col-span-full">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileArchive className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No documents found</p>
              <p className="text-sm text-gray-400">
                {currentUser?.role === 'admin'
                  ? 'Upload your first document to get started'
                  : 'No documents are available yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <CardHeader className="border-b bg-white shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Upload Document</CardTitle>
                <Button variant="outline" size="sm" onClick={closeUploadModal} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white overflow-y-auto">
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Select File *</label>
                  <Input
                    key={fileInputKey}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log('📁 File selected:', {
                        name: file?.name,
                        size: file?.size,
                        type: file?.type
                      });
                      setFormData({ 
                        ...formData, 
                        file,
                        title: formData.title || (file ? file.name.split('.')[0] : '')
                      });
                    }}
                    disabled={uploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                    className="cursor-pointer"
                  />
                  {formData.file && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <FileCheck className="h-4 w-4" />
                      Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                    </p>
                  )}
                  {formData.file && formData.file.size === 0 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Warning: This file appears to be empty (0 bytes)
                    </p>
                  )}
                  {!formData.file && (
                    <p className="text-xs text-red-600 mt-1">
                      * Please select a file to upload
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, Word, Excel, PowerPoint, Images, Text (Max: 10MB)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Title *</label>
                  <Input
                    required
                    placeholder="Document title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={uploading}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Category *</label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      disabled={uploading}
                    >
                      <option value="training">Training</option>
                      <option value="policy">Policy</option>
                      <option value="project">Project</option>
                      <option value="form">Form</option>
                      <option value="certificate">Certificate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Expiry Date</label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      disabled={uploading}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
                  <Textarea
                    placeholder="Brief description of the document"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={uploading}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Tags (comma separated)</label>
                  <Input
                    placeholder="e.g., important, training, 2024"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => {
                        const isPublic = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          isPublic,
                          selectedUsers: isPublic ? [] : formData.selectedUsers // Clear selection if public
                        });
                      }}
                      disabled={uploading}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isPublic" className="text-sm font-semibold text-blue-900 cursor-pointer">
                      <Unlock className="h-4 w-4 inline mr-1" />
                      Make this document public (accessible to all employees)
                    </label>
                  </div>
                  
                  {!formData.isPublic && currentUser?.role === 'admin' && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        <Users className="h-4 w-4 inline mr-1" />
                        Share with specific employees (optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Select employees who can access this document</p>
                      <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded p-2 bg-white">
                        {users.filter(u => u.role === 'intern').map(user => (
                          <label key={user._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.selectedUsers.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedUsers: [...formData.selectedUsers, user._id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedUsers: formData.selectedUsers.filter(id => id !== user._id)
                                  });
                                }
                              }}
                              disabled={uploading}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{user.name} ({user.email})</span>
                          </label>
                        ))}
                        {users.filter(u => u.role === 'intern').length === 0 && (
                          <p className="text-xs text-gray-400 p-2">No employees available</p>
                        )}
                      </div>
                      {formData.selectedUsers.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">
                          {formData.selectedUsers.length} employee(s) selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={closeUploadModal}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Share Document</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowShareModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{selectedDoc.title}</h3>
                <p className="text-sm text-muted-foreground">Choose who can access this document</p>
              </div>

              {/* Current Shares */}
              {selectedDoc.sharedWith && selectedDoc.sharedWith.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Currently shared with:</p>
                  <div className="space-y-2">
                    {selectedDoc.sharedWith.map((share: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{share.userId?.name || 'Unknown'}</span>
                        <Badge variant="outline">{share.accessLevel}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleShare} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Select User *</label>
                  <select
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={shareData.userId}
                    onChange={(e) => setShareData({ ...shareData, userId: e.target.value })}
                  >
                    <option value="">Choose a user</option>
                    {users.filter(u => 
                      u._id !== currentUser?._id && 
                      !selectedDoc.sharedWith?.some((s: any) => s.userId?._id === u._id)
                    ).map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Access Level *</label>
                  <select
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={shareData.accessLevel}
                    onChange={(e) => setShareData({ ...shareData, accessLevel: e.target.value as any })}
                  >
                    <option value="view">View Only</option>
                    <option value="download">View & Download</option>
                    <option value="edit">View, Download & Edit</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setShowShareModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Document Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 bg-white">
              <div>
                <h3 className="font-semibold text-lg">{selectedDoc.title}</h3>
                {selectedDoc.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedDoc.description}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge className={getCategoryColor(selectedDoc.category)}>
                    {selectedDoc.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="font-semibold">{selectedDoc.fileType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-semibold">{formatFileSize(selectedDoc.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="font-semibold">{selectedDoc.downloads}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded By</p>
                  <p className="font-semibold">{selectedDoc.uploadedBy?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upload Date</p>
                  <p className="font-semibold">{new Date(selectedDoc.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Access Level</p>
                  <Badge className={selectedDoc.isPublic ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                    {selectedDoc.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                {selectedDoc.expiryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expires On</p>
                    <p className="font-semibold text-red-600">{new Date(selectedDoc.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedDoc.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoc.sharedWith && selectedDoc.sharedWith.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Shared With</p>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    {selectedDoc.sharedWith.map((share: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{share.userId?.name || 'Unknown'}</span>
                        <Badge variant="outline">{share.accessLevel}</Badge>
                      </div>
                    ))}
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
