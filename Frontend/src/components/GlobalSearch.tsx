'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, FileText, Calendar, MessageSquare, File, X, Clock } from 'lucide-react';
import { userAPI, taskAPI, documentAPI, messageAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  type: 'user' | 'task' | 'document' | 'message';
  id: string;
  title: string;
  subtitle?: string;
  link: string;
  icon: React.ReactNode;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search Users
      try {
        const usersRes = await userAPI.getUsers({ search: searchTerm });
        const users = usersRes.data.data || [];
        users.slice(0, 3).forEach((user: any) => {
          searchResults.push({
            type: 'user',
            id: user._id,
            title: user.name,
            subtitle: user.email,
            link: `/dashboard/users`,
            icon: <User className="h-4 w-4 text-blue-600" />
          });
        });
      } catch (error) {
        console.error('User search error:', error);
      }

      // Search Tasks
      try {
        const tasksRes = await taskAPI.getTasks({ search: searchTerm });
        const tasks = tasksRes.data.data || [];
        tasks.slice(0, 3).forEach((task: any) => {
          searchResults.push({
            type: 'task',
            id: task._id,
            title: task.title,
            subtitle: `Due: ${new Date(task.dueDate).toLocaleDateString()}`,
            link: `/dashboard/tasks`,
            icon: <FileText className="h-4 w-4 text-green-600" />
          });
        });
      } catch (error) {
        console.error('Task search error:', error);
      }

      // Search Documents
      try {
        const docsRes = await documentAPI.getDocuments({ search: searchTerm });
        const docs = docsRes.data.data || [];
        docs.slice(0, 3).forEach((doc: any) => {
          searchResults.push({
            type: 'document',
            id: doc._id,
            title: doc.title,
            subtitle: doc.category,
            link: `/dashboard/documents`,
            icon: <File className="h-4 w-4 text-purple-600" />
          });
        });
      } catch (error) {
        console.error('Document search error:', error);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full h-10 w-10 border-gray-300 hover:bg-gray-100"
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <Search className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)}></div>

          {/* Search Modal */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search users, tasks, documents..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-3">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleResultClick(result.link)}
                      className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs">
                        {result.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Start typing to search</p>
                  <p className="text-xs text-gray-400 mt-1">Search for users, tasks, or documents</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">ESC</kbd>
                    to close
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
