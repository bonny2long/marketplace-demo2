'use client'; // This page uses client-side hooks (useAuth, useEffect, useState)

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { useAuth } from '@/context/auth'; // Import useAuth hook
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Shadcn UI Card
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Shadcn UI Avatar
import { Loader2, Frown, Package, Mail } from 'lucide-react'; // Icons for loading, error, package, mail
import Image from 'next/image'; // Next.js Image component
import { Badge } from '@/components/ui/badge'; // Shadcn UI Badge

// Define the structure for a marketplace listing (matching your Supabase 'listings' table)
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller_email: string;
  image_url: string | null;
  location: string;
  created_at: string;
  updated_at: string;
}

// UserProfilePage component to display user's profile and their listings
const UserProfilePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  // Function to fetch listings created by the current user
  const fetchUserListings = useCallback(async (email: string) => {
    setListingsLoading(true);
    setListingsError(null);
    try {
      // Fetch all listings
      const response = await fetch('/api/listings');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch listings.');
      }
      const allListings: Listing[] = await response.json();

      // Filter listings by the current user's email
      const filtered = allListings.filter(listing => listing.seller_email === email);
      setUserListings(filtered);
    } catch (err: any) {
      console.error('Error fetching user listings:', err);
      setListingsError(err.message || 'Could not load your listings. Please try again.');
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If not authenticated and auth check is complete, redirect to sign-in
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
    // If user is loaded, fetch their listings
    if (user && user.email) {
      fetchUserListings(user.email);
    }
  }, [user, authLoading, router, fetchUserListings]);

  // Helper function to capitalize the first letter of a string for display
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
  };

  // Show loading state for authentication or listings
  if (authLoading || listingsLoading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  // If not authenticated after loading, show a message (should be redirected by useEffect)
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 text-gray-600 text-center">
        <Frown size={48} className="mb-4" />
        <p className="text-xl">Please sign in to view your profile.</p>
        <Button onClick={() => router.push('/auth/signin')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col p-4 md:p-8 bg-gray-50">
      <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-xl p-6 mb-8">
        <CardHeader className="text-center mb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-blue-500 shadow-md">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email || user.id}`} alt="User Avatar" />
            <AvatarFallback className="text-4xl font-bold text-blue-600 bg-blue-100">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-4xl font-bold text-gray-800">
            {user.email || 'Your Profile'}
          </CardTitle>
          <p className="text-gray-600 mt-2 text-lg flex items-center justify-center">
            <Mail size={20} className="mr-2 text-gray-500" />
            {user.email}
          </p>
          {/* Add more profile details here if you extend your user schema */}
        </CardHeader>
      </Card>

      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left max-w-5xl mx-auto">
        Your Listings
      </h2>

      {listingsError && (
        <div className="flex flex-col justify-center items-center h-48 text-red-600 font-semibold text-center max-w-5xl mx-auto">
          <Frown size={48} className="mb-4" />
          <p>{listingsError}</p>
          <Button onClick={() => user.email && fetchUserListings(user.email)} className="mt-4">
            Retry Loading Listings
          </Button>
        </div>
      )}

      {!listingsLoading && !listingsError && userListings.length === 0 && (
        <div className="flex flex-col justify-center items-center h-48 text-gray-500 text-center max-w-5xl mx-auto">
          <Package size={48} className="mb-4" />
          <p className="text-xl font-semibold">You haven't listed any items yet.</p>
          <p className="text-md">Start by creating a new listing!</p>
          <Button onClick={() => router.push('/create/item')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            Create New Listing
          </Button>
        </div>
      )}

      {!listingsLoading && !listingsError && userListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-5xl mx-auto w-full">
          {userListings.map((item) => (
            <Card
              key={item.id}
              className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={item.image_url || `https://placehold.co/400x300/F0F0F0/333333?text=No+Image`}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/400x300/F0F0F0/333333?text=Image+Error`;
                  }}
                />
              </div>
              <CardContent className="p-3">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {item.title}
                </h3>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  ${item.price.toLocaleString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-3 pt-0">
                <span className="text-sm text-gray-600">{item.location}</span>
                <Badge
                  className={`text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800`}
                >
                  {capitalizeFirstLetter(item.category)}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
