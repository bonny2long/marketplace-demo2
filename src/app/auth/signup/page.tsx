'use client'; // This page handles user input and state, so it's a client component

import React, { useState } from 'react';
import Link from 'next/link'; // For navigation to other auth pages
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Input } from '@/components/ui/input'; // Shadcn UI Input
import { Label } from '@/components/ui/label'; // Shadcn UI Label
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn UI Card
import { supabase } from '@/lib/supabase'; // Import your Supabase client
import { Loader2 } from 'lucide-react'; // For loading spinner

// SignUpPage component for user registration
const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // For success messages

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Use Supabase's signUp method with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        console.error('Supabase Sign Up Error:', signUpError);
        return;
      }

      if (data.user) {
        // User created, but might need email confirmation depending on Supabase settings
        setMessage('Sign up successful! Please check your email to confirm your account.');
        // Optionally, redirect after a short delay or once email is confirmed
        // router.push('/auth/signin');
      } else {
        // This case might happen if email confirmation is required and user is not immediately signed in
        setMessage('Sign up initiated. Please check your email for a confirmation link.');
      }
    } catch (err: any) {
      console.error('Unexpected Sign Up Error:', err);
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-xl p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Create Your Account
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sign up to start listing and messaging.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email Input */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {/* Success Message */}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            {/* Sign Up Button */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          {/* Link to Sign In Page */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
