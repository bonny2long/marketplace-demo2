import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Assuming you're using Geist font
import "./globals.css"; // Your global CSS

import { AuthProvider } from '@/context/auth'; // Import the AuthProvider

// Import client-side components that use AuthContext within the layout
import ClientLayoutContent from './ClientLayoutContent'; // New component to hold Header, Sidebar, and children

export const metadata: Metadata = {
  title: "Mockbook Marketplace",
  description: "A mock Facebook Marketplace application built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        {/* Wrap the entire application content with AuthProvider */}
        <AuthProvider>
          {/* Render a client component that then renders Header, Sidebar, and children */}
          <ClientLayoutContent>
            {children}
          </ClientLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
