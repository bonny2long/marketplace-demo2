'use client'; // This component fetches data and has interactive elements

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For accessing URL parameters and navigation
import Image from 'next/image'; // Next.js Image component
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Shadcn UI Card
import { Badge } from '@/components/ui/badge'; // Shadcn UI Badge
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Loader2, Frown } from 'lucide-react'; // Icons for loading and error

// Define the structure for a marketplace item (matching your Supabase 'listings' table)
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller_email: string;
  image_url: string | null; // Can be null if no image is uploaded
  location: string;
  created_at: string;
  updated_at: string;
}

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  // Replace hyphens with spaces and then capitalize each word
  return string
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// CategoryPage component to display items within a specific category
const CategoryPage = () => {
  const router = useRouter();
  const params = useParams(); // Get URL parameters
  const { slug } = params; // Extract the 'slug' (category) from parameters

  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch listings from the API and filter by category
  const fetchCategoryListings = useCallback(async (categorySlug: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all listings (or you could modify your /api/listings to accept a category filter)
      const response = await fetch('/api/listings');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch listings.');
      }
      const allListings: Listing[] = await response.json();

      // Filter the fetched listings by the current category slug
      const items = allListings.filter(item => item.category === categorySlug);

      if (items.length > 0) {
        setFilteredListings(items);
      } else {
        setError(`No items found in category: "${capitalizeFirstLetter(categorySlug)}".`);
        setFilteredListings([]); // Ensure filteredListings is empty
      }
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error('Error fetching category listings:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading category listings.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchCategoryListings(slug);
    } else {
      setError('Invalid category provided.');
      setLoading(false);
    }
  }, [slug, fetchCategoryListings]); // Re-run effect if slug or fetchCategoryListings changes

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading category items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 text-red-600 font-semibold text-center">
        <Frown size={48} className="mb-4" />
        <p className="text-xl">Error: {error}</p>
        <Button onClick={() => router.push('/')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    // Main container for the category page
    <div className="min-h-[calc(100vh-100px)] flex flex-col p-4 md:p-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Category: {capitalizeFirstLetter(slug as string)}
      </h2>

      {filteredListings.length === 0 && (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500 text-center">
          <Frown size={48} className="mb-4" />
          <p className="text-xl font-semibold">No listings found in this category.</p>
          <p className="text-md">Try creating a new listing or checking other categories.</p>
        </div>
      )}

      {filteredListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredListings.map((item) => (
            <Card
              key={item.id}
              className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/item/${item.id}`)} // Navigate to item detail page
            >
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={item.image_url || `https://placehold.co/400x300/F0F0F0/333333?text=No+Image`} // Use image_url from Supabase
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Added sizes prop
                  priority={false} // Not LCP for all items in grid
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
      <div className="mt-8 text-center">
        <Button onClick={() => router.push('/')} variant="outline" className="text-gray-700 hover:text-blue-600">
          Back to All Items
        </Button>
      </div>
    </div>
  );
};

export default CategoryPage;
