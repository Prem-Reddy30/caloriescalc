'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Apple, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'ready' | 'slow'>('checking');

  // Wake up Render backend on page load (free tier sleeps after 15 min)
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        setServerStatus('ready');
      } catch {
        // Backend may be cold-starting, mark as slow but still allow login attempt
        setServerStatus('slow');
      }
    };
    wakeBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Error ${res.status}: Login failed.`);
        setLoading(false);
        return;
      }

      // Save auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Login successful! Redirecting...');

      // Use window.location for a hard redirect to avoid any router issues
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (err: any) {
      console.error('Connection error:', err);
      setError('Connection failed. The server is starting up (this takes ~30 seconds on first load). Please wait and try again.');
      setLoading(false);
      setServerStatus('slow');
      // Auto-retry wake-up
      setTimeout(async () => {
        try { await fetch(`${API_BASE_URL}/health`); setServerStatus('ready'); } catch {}
      }, 5000);
    }
  };

  // Handle Firebase redirect result on mount (for mobile Google sign-in)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const user = result.user;
          if (!user.email) {
            throw new Error('No email associated with this Google account.');
          }

          const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.displayName || 'Google User',
              email: user.email,
              googleId: user.uid,
              avatar: user.photoURL || null
            })
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Server authentication failed.');
          }

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (data.user.profile && data.user.profile.age) {
            localStorage.setItem('onboarding', JSON.stringify({
              completed: true,
              name: data.user.name,
              age: data.user.profile.age,
              weight: data.user.profile.weight,
              height: data.user.profile.height,
              gender: data.user.profile.gender,
              calorieGoal: data.user.profile.calorieGoal,
              diet: data.user.profile.dietPreference
            }));
          } else {
            localStorage.setItem('onboarding', JSON.stringify({ completed: false }));
          }

          setSuccess(`Signed in successfully as ${user.email}! Redirecting...`);
          setLoading(false);

          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }
      } catch (err: any) {
        console.error('Google Redirect Error:', err);
        setError(err.message || 'Google Authentication failed.');
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Check if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return; // Redirect will handle the login on reload
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email) {
        throw new Error('No email associated with this Google account.');
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || 'Google User',
          email: user.email,
          googleId: user.uid,
          avatar: user.photoURL || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Server authentication failed.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.profile && data.user.profile.age) {
        localStorage.setItem('onboarding', JSON.stringify({
          completed: true,
          name: data.user.name,
          age: data.user.profile.age,
          weight: data.user.profile.weight,
          height: data.user.profile.height,
          gender: data.user.profile.gender,
          calorieGoal: data.user.profile.calorieGoal,
          diet: data.user.profile.dietPreference
        }));
      } else {
        localStorage.setItem('onboarding', JSON.stringify({ completed: false }));
      }

      setSuccess(`Signed in successfully as ${user.email}! Redirecting...`);
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Sign-In is not enabled in your Firebase Console. To fix this: Go to Firebase Console > Build > Authentication > Sign-in Method, click "Add new provider", select "Google", configure your support email, and click Save.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Authentication failed.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Apple className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your NutriBudget AI account</CardDescription>
        </CardHeader>
        <CardContent>

          {serverStatus === 'checking' && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span>Connecting to server… (first load may take 30s)</span>
            </div>
          )}

          {serverStatus === 'slow' && !error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
              ⚠️ <span>Server is warming up. Please try again in a few seconds.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.54 0 2.94.57 4.03 1.5l3.055-3.055C19.12 1.935 15.89 1 12.24 1 6.03 1 12.24s5.03 11.24 11.24 11.24c6.33 0 11.24-4.91 11.24-11.24 0-.75-.08-1.46-.22-2.155H12.24z"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Sign in with Google</span>
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Don&apos;t have an account? </span>
            <Link href="/register" className="text-green-600 hover:underline font-semibold">
              Sign up
            </Link>
          </div>

          {/* Quick test helper — remove in production */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-500">
            <strong>No account?</strong> Go to{' '}
            <Link href="/register" className="text-green-600 underline">Register</Link> first, then come back to sign in.
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
