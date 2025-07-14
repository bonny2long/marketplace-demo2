'use client'; // This component fetches data and has interactive elements

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For accessing URL parameters and navigation
import Image from 'next/image'; // Next.js Image component
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Shadcn UI Card
import { Badge } from '@/components/ui/badge'; // Shadcn UI Badge
import { MapPin, Tag, User, MessageSquare, X, Loader2, Frown } from 'lucide-react'; // Icons for item details, close button, loading, and error
import { Textarea } from '@/components/ui/textarea'; // Shadcn UI Textarea for message input
import { Label } from '@/components/ui/label'; // Shadcn UI Label
import { useAuth } from '@/context/auth'; // Import useAuth hook

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

// ItemDetailPage component to display details of a specific item
const ItemDetailPage = () => {
  const router = useRouter();
  const params = useParams(); // Get URL parameters
  const { id } = params; // Extract the 'id' from parameters
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for item details
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Function to fetch item details from the API
  const fetchItemDetails = async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch item details.');
      }
      const data: Listing = await response.json();
      setItem(data);
    } catch (err: any) {
      console.error('Error fetching item details:', err);
      setError(err.message || 'Could not load item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchItemDetails(id);
    } else {
      setError('Invalid item ID provided.');
      setLoading(false);
    }
  }, [id]);

  // Handle sending a message (now using your /api/messages endpoint)
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message.');
      return;
    }
    if (!item) {
      alert('Cannot send message, item data is missing.');
      return;
    }
    if (!user) { // Require user to be logged in to send message
      alert('Please sign in to send a message.');
      router.push('/auth/signin'); // Redirect to sign-in
      return;
    }

    setIsSendingMessage(true);

    try {
      const messagePayload = {
        listing_id: item.id,
        buyer_email: user.email!, // Use authenticated user's email (non-null assertion as we checked above)
        seller_email: item.seller_email,
        message: messageContent,
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message.');
      }

      alert('Message sent successfully!');
      setMessageContent('');
      setShowContactModal(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Helper function to capitalize the first letter of a string for display
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
  };

  // Show loading state for authentication or item details
  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading details...</p>
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

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 text-gray-600 text-center">
        <Frown size={48} className="mb-4" />
        <p className="text-xl">No item data available.</p>
        <Button onClick={() => router.push('/')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center p-4 md:p-8 bg-gray-50">
      <Card className="w-full max-w-5xl shadow-lg rounded-xl p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-4xl font-bold text-gray-800">
            {item.title}
          </CardTitle>
          <p className="text-gray-600 mt-2 text-xl font-semibold">
            ${item.price.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Item Image Section */}
          <div className="relative w-full h-80 md:h-96 bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <Image
              src={item.image_url || `https://placehold.co/800x600/F0F0F0/333333?text=No+Image`}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/800x600/F0F0F0/333333?text=Image+Error`;
              }}
            />
          </div>

          {/* Item Details Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800">Details</h3>
            <div className="flex items-center text-gray-700">
              <MapPin size={20} className="mr-2 text-blue-600" />
              <span>Location: <span className="font-medium">{item.location}</span></span>
            </div>
            <div className="flex items-center text-gray-700">
              <Tag size={20} className="mr-2 text-purple-600" />
              <span>Category:
                <Badge
                  className={`ml-2 text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800`}
                >
                  {capitalizeFirstLetter(item.category)}
                </Badge>
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <User size={20} className="mr-2 text-gray-500" />
              <span>Seller: <span className="font-medium">{item.seller_email}</span></span>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {item.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={() => setShowContactModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md text-lg transition-colors duration-200"
                disabled={authLoading || !user} // Disable if auth is loading or no user
              >
                <MessageSquare size={20} className="mr-2" />
                {authLoading ? 'Checking Auth...' : user ? 'Contact Seller' : 'Sign In to Message'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1 text-gray-700 hover:text-blue-600 hover:border-blue-600 transition-colors duration-200"
              >
                Back to Marketplace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Seller Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 rounded-lg shadow-xl relative bg-white">
            <CardHeader className="flex flex-row justify-between items-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Message {item.seller_email}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactModal(false)}
                className="rounded-full"
                aria-label="Close"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-gray-700 font-medium mb-2 block">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder={`Hi ${item.seller_email}, I'm interested in your ${item.title}...`}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowContactModal(false)} disabled={isSendingMessage}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSendingMessage}>
                {isSendingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ItemDetailPage;
