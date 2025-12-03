'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login with:', { email, password: password ? '***' : 'EMPTY' });

    try {
      console.log('📡 Calling login API...');
      await login(email, password);
      console.log('✅ Login successful, redirecting to dashboard...');
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('❌ Login failed:', err);

      if (typeof err === 'object' && err !== null) {
        const e = err as { message?: string; response?: { data?: unknown; status?: number } };
        console.error('Error response:', e.response?.data);
        console.error('Error status:', e.response?.status);
        setError(e.message ?? 'Login failed');
      } else {
        console.error('Error value:', err);
        setError(String(err) || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 border-4 sm:border-8 border-[#3B7A9E]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image 
            src="/logo.png" 
            alt="Lovosis Technology" 
            width={300} 
            height={80}
            className="h-16 sm:h-20 w-auto"
            priority
          />
        </div>

        {/* Login Card with Logo Color Border */}
        <Card className="border-4 border-[#3B7A9E] shadow-2xl bg-white">
          <CardHeader className="space-y-1 pb-4 sm:pb-6 text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg flex items-start gap-2">
                  <svg className="h-5 w-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12 bg-white border-gray-300 focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#3B7A9E]/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-[#3B7A9E] hover:text-[#2d5f7d] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-12 bg-white border-gray-300 focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#3B7A9E]/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-[#3B7A9E] hover:bg-[#2d5f7d] text-white shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Lovosis Technology Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
