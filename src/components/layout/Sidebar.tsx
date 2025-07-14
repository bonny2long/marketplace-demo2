'use client'; // This component uses client-side hooks (useAuth, useRouter)

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, PlusCircle, ShoppingBag, Car, Building, Shirt, Gamepad, MoreHorizontal, MessageSquare, Bell, LogOut, LogIn, UserPlus, Loader2, User as UserIcon } from 'lucide-react'; // Added UserIcon for profile link
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

const Sidebar = () => {
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
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-gray-100 shadow-md p-4 z-40 overflow-y-auto">
      <nav className="space-y-2">
        {/* Conditional rendering for User Profile / Auth Links */}
        {loading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : user ? (
          // User is logged in: Show profile link and sign out button
          <>
            <Link href="/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email || user.id}`} alt="User Avatar" />
                <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-gray-800 truncate">{user.email || 'Your Profile'}</span>
            </Link>
            <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <LogOut size={20} className="mr-3 text-red-600" />
              <span className="text-gray-700 font-medium">Sign Out</span>
            </Button>
          </>
        ) : (
          // No user logged in: Show Sign In and Sign Up links
          <div className="pt-2 border-b border-gray-200 pb-2 space-y-1">
            <Link href="/auth/signin" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <LogIn size={20} className="mr-3 text-blue-600" />
              <span className="text-gray-700 font-medium">Sign In</span>
            </Link>
            <Link href="/auth/signup" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <UserPlus size={20} className="mr-3 text-green-600" />
              <span className="text-gray-700 font-medium">Sign Up</span>
            </Link>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="pt-2 border-t border-gray-200">
          <Link href="/" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            <Home size={20} className="mr-3 text-blue-600" />
            <span className="text-gray-700 font-medium">Browse</span>
          </Link>
          <Link href="/create" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            <PlusCircle size={20} className="mr-3 text-green-600" />
            <span className="text-gray-700 font-medium">Create New Listing</span>
          </Link>
        </div>

        {/* Categories Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 ml-2">Categories</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/category/electronics" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <ShoppingBag size={20} className="mr-3 text-purple-600" />
                <span className="text-gray-700">Electronics</span>
              </Link>
            </li>
            <li>
              <Link href="/category/vehicles" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Car size={20} className="mr-3 text-red-600" />
                <span className="text-gray-700">Vehicles</span>
              </Link>
            </li>
            <li>
              <Link href="/category/property" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Building size={20} className="mr-3 text-teal-600" />
                <span className="text-gray-700">Property</span>
              </Link>
            </li>
            <li>
              <Link href="/category/apparel" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Shirt size={20} className="mr-3 text-orange-600" />
                <span className="text-gray-700">Apparel</span>
              </Link>
            </li>
            <li>
              <Link href="/category/hobbies" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Gamepad size={20} className="mr-3 text-indigo-600" />
                <span className="text-gray-700">Hobbies</span>
              </Link>
            </li>
            <li>
              <Link href="/category/home-goods" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Home size={20} className="mr-3 text-gray-600" />
                <span className="text-gray-700">Home Goods</span>
              </Link>
            </li>
            <li>
              <Link href="/category/other" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <MoreHorizontal size={20} className="mr-3 text-gray-600" />
                <span className="text-gray-700">Other</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Other Sections (placeholders for now) */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 ml-2">Your Activity</h3>
          <ul className="space-y-1">
            <li>
              <Link href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <MessageSquare size={20} className="mr-3 text-blue-600" />
                <span className="text-gray-700">Messages</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Bell size={20} className="mr-3 text-yellow-600" />
                <span className="text-gray-700">Notifications</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
