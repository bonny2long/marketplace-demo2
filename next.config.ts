import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // List of allowed domains for Next.js Image component
    // Add any external image hosts you use here.
    // 'placehold.co' is added to allow placeholder images.
    // Your Supabase project URL hostname is added for images from storage.
    domains: [
      'placehold.co',
      'mwzkfyjnmtfpuzhaijjt.supabase.co' // <-- ADD THIS LINE
    ],
    // Allow SVG images to be loaded via next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
