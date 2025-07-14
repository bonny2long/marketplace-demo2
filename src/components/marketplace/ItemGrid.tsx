'use client'; // This component fetches data and handles user input, so it's a client component

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Shadcn UI Card components
import { Badge } from '@/components/ui/badge'; // Shadcn UI Badge component
import { Input } from '@/components/ui/input'; // Shadcn UI Input for search
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Shadcn UI Select for category filter
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import Image from 'next/image'; // Next.js Image component
import { Search, Frown } from 'lucide-react'; // Icons for search and empty state

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

// ItemGrid component to display a responsive grid of marketplace items
const ItemGrid = () => {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // Initialize with 'all'

  // Function to fetch listings from the API
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch listings.');
      }
      const data: Listing[] = await response.json();
      setListings(data);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Could not load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Filter listings based on search term and selected category
  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.location?.toLowerCase().includes(searchTerm.toLowerCase());
    // Adjusted filtering logic for 'all' category
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper function to capitalize the first letter of a string for display
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col p-4 md:p-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Today's Picks
      </h2>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        {/* Changed value of "All Categories" SelectItem to "all" */}
        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
          <SelectTrigger className="w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* Changed value to "all" */}
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="home-goods">Home Goods</SelectItem>
            <SelectItem value="vehicles">Vehicles</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="hobbies">Hobbies</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchListings} className="bg-blue-600 hover:bg-blue-700 text-white">
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64 text-gray-600">
          Loading listings...
        </div>
      )}

      {error && (
        <div className="flex flex-col justify-center items-center h-64 text-red-600 font-semibold text-center">
          <Frown size={48} className="mb-4" />
          <p>{error}</p>
          <Button onClick={fetchListings} className="mt-4">
            Retry Loading
          </Button>
        </div>
      )}

      {!loading && !error && filteredListings.length === 0 && (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500 text-center">
          <Frown size={48} className="mb-4" />
          <p className="text-xl font-semibold">No listings found.</p>
          <p className="text-md">Try adjusting your search or filters.</p>
        </div>
      )}

      {!loading && !error && filteredListings.length > 0 && (
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

export default ItemGrid;
