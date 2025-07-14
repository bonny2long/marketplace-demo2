import React from 'react';
import ItemGrid from '@/components/marketplace/ItemGrid'; 

// Main homepage component for the Mockbook Marketplace
const HomePage = () => {
  return (
    // Main container for the homepage content
    <div className="min-h-screen bg-gray-100 py-4">
      {/* Section title for the marketplace items */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Today's Picks
      </h2>

      {/* Render the ItemGrid component to display marketplace items */}
      <ItemGrid />

      {/* Optional: Add more sections or components below the grid */}
      {/* <div className="mt-8 text-center text-gray-600">
        <p>More items coming soon!</p>
      </div> */}
    </div>
  );
};

export default HomePage;
