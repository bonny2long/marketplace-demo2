'use client'; // This component must be a client component

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

interface ClientLayoutContentProps {
  children: React.ReactNode;
}

const ClientLayoutContent: React.FC<ClientLayoutContentProps> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="flex pt-16"> {/* pt-16 to offset fixed header height */}
        <Sidebar />
        <main className="flex-1 ml-64"> {/* ml-64 to offset fixed sidebar width */}
          {children}
        </main>
      </div>
    </>
  );
};

export default ClientLayoutContent;
