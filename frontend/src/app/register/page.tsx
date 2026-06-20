'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Apple, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.errors?.[0]?.msg || data.message || 'Registration failed.';
        setError(msg);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Account created! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
      setLoading(false);
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

          setSuccess(`Account registered as ${user.email} successfully! Redirecting...`);
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

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Check if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return; // Redirect will handle the registration on reload
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

      setSuccess(`Account registered as ${user.email} successfully! Redirecting...`);
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      console.error('Google Sign Up Error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Sign-In is not enabled in your Firebase Console. To fix this: Go to Firebase Console > Build > Authentication > Sign-in Method, click "Add new provider", select "Google", configure your support email, and click Save.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Registration failed.');
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Start your fitness journey with NutriBudget AI</CardDescription>
        </CardHeader>
        <CardContent>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="h-4 w-4" />
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
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.54 0 2.94.57 4.03 1.5l3.055-3.055C19.12 1.935 15.89 1 12.24 1 6.03 1 12.24s5.03 11.24 11.24 11.24c6.33 0 11.24-4.91 11.24-11.24 0-.75-.08-1.46-.22-2.155H12.24z"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Sign up with Google</span>
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link href="/login" className="text-green-600 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
