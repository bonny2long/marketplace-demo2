'use client'; // This component contains interactive forms and state management

import React, { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation'; // For programmatic navigation
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Input } from '@/components/ui/input'; // Shadcn UI Input
import { Textarea } from '@/components/ui/textarea'; // Shadcn UI Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Shadcn UI Select
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn UI Card
import { Label } from '@/components/ui/label'; // Shadcn UI Label
import ImageUpload from '@/components/marketplace/image-upload'; // Import the ImageUpload component
import Image from 'next/image'; // Next.js Image component for preview
import { UploadCloud, Loader2 } from 'lucide-react'; // Removed Frown, Import UploadCloud, Loader2
import { useAuth } from '@/context/auth'; // Import useAuth hook

// CreateItemPage component for submitting a new item for sale
const CreateItemPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  // State to hold form data
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    condition: '', // This field is not in your Supabase schema, but kept for form
    location: '',
    contactEmail: user?.email || '', // Initialize with user's email if logged in
    images: [] as File[],
  });

  // Update contactEmail if user logs in/out after component mounts
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, contactEmail: user.email || '' }));
    } else if (!authLoading) {
      // If auth check is complete and no user, clear email if it was set
      setFormData((prev) => ({ ...prev, contactEmail: '' }));
    }
  }, [user, authLoading]);


  // State for form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  // Handle input changes (for text, number, email inputs)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handle images change from ImageUpload component
  const handleImagesChange = (files: File[]) => {
    setFormData((prev) => ({ ...prev, images: files }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });
  };

  // Basic form validation logic
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Item Name is required.';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.category) newErrors.category = 'Category is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    // Ensure contactEmail is present and valid, especially if user is not logged in
    if (!user && !formData.contactEmail.trim()) { // Only validate if not logged in and field is empty
      newErrors.contactEmail = 'Contact Email is required.';
    } else if (!user && formData.contactEmail.trim() && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address.';
    }
    if (formData.images.length === 0) newErrors.images = 'At least one image is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, ensure contact email is provided and valid
    if (!user) {
      if (!formData.contactEmail.trim()) {
        alert('Please sign in or provide a contact email to create a listing.');
        setErrors((prev) => ({ ...prev, contactEmail: 'Required if not signed in.' }));
        return;
      } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        alert('Please provide a valid contact email.');
        setErrors((prev) => ({ ...prev, contactEmail: 'Invalid email address.' }));
        return;
      }
    }

    if (!validateForm()) {
      alert('Please correct the errors in the form.');
      return;
    }

    setIsSubmitting(true); // Start loading state

    try {
      let imageUrl: string | null = null;

      // 1. Upload images if any
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((file) => {
          imageFormData.append('file', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload images.');
        }
        const uploadResult = await uploadResponse.json();
        if (uploadResult.urls && uploadResult.urls.length > 0) {
          imageUrl = uploadResult.urls[0];
        }
      }

      // Determine seller_email: use authenticated user's email, or fallback to form input
      const sellerEmailToUse = user?.email || formData.contactEmail;
      if (!sellerEmailToUse) {
        throw new Error('Seller email is missing. Please sign in or provide it.');
      }

      // 2. Create the listing in the database
      const listingData = {
        title: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        seller_email: sellerEmailToUse, // Use authenticated user's email or form input
        image_url: imageUrl,
        location: formData.location,
      };

      const createListingResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!createListingResponse.ok) {
        const errorData = await createListingResponse.json();
        throw new Error(errorData.error || 'Failed to create listing.');
      }

      alert('Your listing has been created successfully!');
      router.push('/');
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error('Submission error:', err);
      if (err instanceof Error) {
        alert(`Error creating listing: ${err.message}`);
      } else {
        alert('An unexpected error occurred during listing creation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state for authentication
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center p-4 md:p-8 bg-gray-50">
      <Card className="w-full max-w-5xl shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div>
          <CardHeader className="text-center md:text-left mb-6 p-0">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Create New Item Listing
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Fill in the details for your item.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium mb-1 block">Item Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Vintage Leather Jacket"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price" className="text-gray-700 font-medium mb-1 block">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full rounded-md border px-3 py-2 ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium mb-1 block">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full rounded-md border px-3 py-2 ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium mb-1 block">Category</Label>
                <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
                  <SelectTrigger className={`w-full rounded-md border px-3 py-2 ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="home-goods">Home Goods</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="hobbies">Hobbies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Condition (Optional, not in DB schema) */}
              <div>
                <Label htmlFor="condition" className="text-gray-700 font-medium mb-1 block">Condition (Optional)</Label>
                <Select onValueChange={(value) => handleSelectChange('condition', value)} value={formData.condition}>
                  <SelectTrigger className={`w-full rounded-md border px-3 py-2 ${errors.condition ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Used - Like New</SelectItem>
                    <SelectItem value="good">Used - Good</SelectItem>
                    <SelectItem value="fair">Used - Fair</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-gray-700 font-medium mb-1 block">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Springfield, IL"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Contact Email - Read-only if user is logged in */}
              <div>
                <Label htmlFor="contactEmail" className="text-gray-700 font-medium mb-1 block">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="e.g., your.email@example.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  disabled={!!user} // Disable if user is logged in
                  className={`w-full rounded-md border px-3 py-2 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 ${user ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {user && <p className="text-xs text-gray-500 mt-1">Your logged-in email will be used.</p>}
                {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
              </div>

              {/* Images Upload */}
              <div>
                <Label className="text-gray-700 font-medium mb-1 block">Upload Images</Label>
                <ImageUpload onImagesChange={handleImagesChange} maxFiles={5} />
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md text-lg transition-colors duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>

              {/* Back Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full mt-4 text-gray-700 hover:text-blue-600 hover:border-blue-600 transition-colors duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Right Column: Real-time Preview */}
        <div className="md:border-l md:pl-8 border-gray-200">
          <CardHeader className="text-center md:text-left mb-6 p-0">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Listing Preview
            </CardTitle>
            <p className="text-gray-600 mt-2">
              See how your listing will look.
            </p>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {/* Item Name Preview */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800">
                {formData.name || 'Item Name Preview'}
              </h4>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formData.price ? `$${parseFloat(formData.price).toLocaleString()}` : '$0.00'}
              </p>
            </div>

            {/* Image Preview */}
            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
              {formData.images.length > 0 ? (
                <Image
                  src={URL.createObjectURL(formData.images[0])}
                  alt="Listing Preview"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/600x400/F0F0F0/333333?text=Image+Error`;
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <UploadCloud size={64} />
                </div>
              )}
            </div>

            {/* Other Details Preview */}
            <div className="space-y-2 text-gray-700">
              <p><strong>Category:</strong> {formData.category || 'N/A'}</p>
              <p><strong>Condition:</strong> {formData.condition || 'N/A'}</p>
              <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
              <p><strong>Contact:</strong> {user?.email || formData.contactEmail || 'N/A'}</p>
            </div>

            {/* Description Preview */}
            <div>
              <h5 className="text-lg font-semibold text-gray-800 mt-4">Description:</h5>
              <p className="text-gray-700 leading-relaxed">
                {formData.description || 'Your item description will appear here.'}
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default CreateItemPage;
