'use client'; // This component uses client-side hooks (useAuth, useRouter)

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
// Ensure Loader2 is imported here
import { Search, Home, Store, Users, Bell, MessageSquare, LogOut, LogIn, UserPlus, Loader2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Menu } from 'lucide-react'; // Added ESLint disable for 'Menu' if it's truly unused in JSX
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

const Header = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#1877F2] to-[#166FE5] p-3 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Left section: Logo/Title and Search Bar */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white text-3xl font-extrabold tracking-tight drop-shadow-sm">
            Mockbook
          </Link>
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 text-gray-300" size={20} />
            <Input
              type="text"
              placeholder="Search Mockbook"
              className="pl-10 pr-4 py-2 rounded-full bg-blue-50 text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
                         w-64 lg:w-80 shadow-inner"
            />
          </div>
        </div>

        {/* Center section: Navigation Icons */}
        <nav className="flex-1 flex justify-center space-x-6 md:space-x-12">
          <Link href="/" className="p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 group transform hover:scale-105">
            <Home className="text-white group-hover:text-white transition-colors" size={28} />
          </Link>
          <Link href="/" className="p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 group transform hover:scale-105">
            <Store className="text-white group-hover:text-white transition-colors" size={28} />
          </Link>
          <a href="#" className="p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 group transform hover:scale-105">
            <Users className="text-white group-hover:text-white transition-colors" size={28} />
          </a>
        </nav>

        {/* Right section: User Actions/Notifications */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
            <Search className="text-white" size={24} />
          </button>
          <button className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
            <Bell className="text-white" size={24} />
          </button>
          <button className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
            <MessageSquare className="text-white" size={24} />
          </button>

          {/* Conditional rendering based on auth state */}
          {loading ? (
            <div className="p-3">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : user ? (
            // User is logged in
            <Button onClick={handleSignOut} variant="ghost" className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
              <LogOut className="text-white" size={24} />
            </Button>
          ) : (
            // No user logged in
            <>
              <Link href="/auth/signin" passHref>
                <Button variant="ghost" className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
                  <LogIn className="text-white" size={24} />
                </Button>
              </Link>
              <Link href="/auth/signup" passHref>
                <Button variant="ghost" className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
                  <UserPlus className="text-white" size={24} />
                </Button>
              </Link>
            </>
          )}
          {/* This is the button that would use the Menu icon if uncommented */}
          {/* <button className="p-3 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-md">
            <Menu className="text-white" size={24} />
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
