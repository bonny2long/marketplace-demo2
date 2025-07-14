'use client'; // This component handles DOM events (drag/drop), so it's a client component

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, XCircle } from 'lucide-react'; // Icons for upload and remove
import Image from 'next/image'; // Next.js Image component for preview

// Define props for the ImageUpload component
interface ImageUploadProps {
  onImagesChange: (files: File[]) => void; // Callback to pass selected files to parent
  maxFiles?: number; // Maximum number of files allowed
  initialImages?: string[]; // Optional: initial image URLs for editing existing listings
}

// ImageUpload component with drag & drop functionality and previews
const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange, maxFiles = 5, initialImages = [] }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages); // Stores Data URLs for preview
  const [isDragging, setIsDragging] = useState(false); // State for drag-over effect
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

  // Function to handle file processing (adding and removing)
  const processFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const currentTotalFiles = selectedFiles.length + validFiles.length;

    if (currentTotalFiles > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    onImagesChange(updatedFiles); // Notify parent component about file changes

    // Create object URLs for new image previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }, [selectedFiles, maxFiles, onImagesChange]);

  // Handle file selection via input click
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
      // Clear the input value to allow re-uploading the same file if needed
      event.target.value = '';
    }
  }, [processFiles]);

  // Handle drag over event
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default to allow drop
    setIsDragging(true);
  }, []);

  // Handle drag leave event
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle drop event
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  }, [processFiles]);

  // Handle removing a selected image
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(imagePreviews[indexToRemove]);

    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);

    setSelectedFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    onImagesChange(updatedFiles); // Notify parent
  }, [selectedFiles, imagePreviews, onImagesChange]);

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} // Trigger file input on click
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
      >
        <UploadCloud size={48} className="text-gray-400 mb-3" />
        <p className="text-gray-700 text-center font-medium">
          Drag & drop your photos here, or <span className="text-blue-600 font-semibold">click to browse</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Max {maxFiles} images (JPG, PNG, GIF, SVG)
        </p>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {imagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden shadow-md group">
              <Image
                src={previewUrl}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                aria-label={`Remove image ${index + 1}`}
              >
                <XCircle size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
