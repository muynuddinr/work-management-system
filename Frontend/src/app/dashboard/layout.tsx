'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationDropdown from '@/components/NotificationDropdown';
import GlobalSearch from '@/components/GlobalSearch';
import { 
  LayoutDashboard, 
  Users, 
  Crown, 
  User, 
  CheckSquare, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Award, 
  FileArchive,
  LogOut,
  UserCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: ('admin' | 'intern')[];
  color?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'intern'], color: 'from-blue-500 to-indigo-600' },
  { href: '/dashboard/users', icon: Users, label: 'Users', roles: ['admin'], color: 'from-purple-500 to-pink-600' },
  { href: '/dashboard/attendance', icon: Calendar, label: 'Attendance', roles: ['admin', 'intern'], color: 'from-green-500 to-emerald-600' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks', roles: ['admin', 'intern'], color: 'from-orange-500 to-red-600' },
  { href: '/dashboard/worklogs', icon: FileText, label: 'Work Logs', roles: ['admin', 'intern'], color: 'from-cyan-500 to-blue-600' },
  { href: '/dashboard/evaluations', icon: Award, label: 'Evaluations', roles: ['admin', 'intern'], color: 'from-yellow-500 to-orange-600' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages', roles: ['admin', 'intern'], color: 'from-indigo-500 to-purple-600' },
  { href: '/dashboard/documents', icon: FileArchive, label: 'Documents', roles: ['admin', 'intern'], color: 'from-teal-500 to-cyan-600' },
  { href: '/dashboard/profile', icon: UserCircle, label: 'Profile', roles: ['admin', 'intern'], color: 'from-pink-500 to-rose-600' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredNavItems = navItems.filter((item) => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  OfficePro
                </h2>
                <p className="text-xs text-gray-500 font-medium">Management Suite</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200/50 bg-linear-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <UserCircle className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <Badge className={`mt-1 text-xs flex items-center gap-1 ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                }`}>
                  {user?.role === 'admin' ? (
                    <>
                      <Crown className="h-3 w-3" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      <span>Employee</span>
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-linear-to-r ' + item.color + ' text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'text-gray-700 hover:bg-gray-100/80 hover:scale-102'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                      }`} />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200/50">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 font-medium"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search - Hidden on mobile */}
                <div className="hidden md:block">
                  <GlobalSearch />
                </div>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile Avatar */}
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="rounded-full h-10 px-2 sm:px-3 border-gray-300 hover:bg-gray-100 gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200/50 bg-white/60 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mt-8 sm:mt-12">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-3">
              <p className="text-xs sm:text-sm">© 2025 OfficePro. All rights reserved.</p>
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/support" className="hover:text-blue-600 transition-colors text-xs sm:text-sm">Support</Link>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors text-xs sm:text-sm">Privacy</Link>
                <Link href="/terms" className="hover:text-blue-600 transition-colors text-xs sm:text-sm">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
