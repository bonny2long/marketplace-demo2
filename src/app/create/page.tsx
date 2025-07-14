'use client'; // This page will have interactive elements, so it's a client component

import React from 'react';
import Link from 'next/link'; // Next.js Link component for client-side navigation
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn UI Card
import { PackagePlus, Home, Car, Building, Shirt, Gamepad } from 'lucide-react'; // Icons for different listing types

// CreateListingPage component for selecting the type of listing
const CreateListingPage = () => {
  return (
    // Main container for the page, with responsive padding and centering
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">
            What are you listing?
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Choose the category that best describes your item.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card for general item listing */}
          <Link href="/create/item" passHref>
            <Card className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-blue-50 hover:bg-blue-100 border-blue-200">
              <PackagePlus size={48} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Item for Sale</h3>
              <p className="text-center text-gray-600 text-sm">
                Sell a physical item like electronics, furniture, or clothes.
              </p>
            </Card>
          </Link>

          {/* Card for property listing */}
          <Link href="/create/property" passHref>
            <Card className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-green-50 hover:bg-green-100 border-green-200">
              <Building size={48} className="text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Property for Rent/Sale</h3>
              <p className="text-center text-gray-600 text-sm">
                List a house, apartment, or commercial space.
              </p>
            </Card>
          </Link>

          {/* Card for vehicle listing */}
          <Link href="/create/vehicle" passHref>
            <Card className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
              <Car size={48} className="text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Vehicle for Sale</h3>
              <p className="text-center text-gray-600 text-sm">
                Sell a car, motorcycle, or other vehicle.
              </p>
            </Card>
          </Link>

          {/* Card for free stuff listing */}
          <Link href="/create/free-stuff" passHref>
            <Card className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-red-50 hover:bg-red-100 border-red-200">
              <Gamepad size={48} className="text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Free Item</h3>
              <p className="text-center text-gray-600 text-sm">
                Give away an item for free.
              </p>
            </Card>
          </Link>
        </CardContent>
        <div className="mt-8 text-center">
          <Link href="/" passHref>
            <Button variant="outline" className="text-gray-700 hover:text-blue-600">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CreateListingPage;
