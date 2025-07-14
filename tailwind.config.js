/** @type {import('tailwindcss').Config} */
module.exports = {
    // The 'content' array for Tailwind CSS v3.
    // It tells Tailwind where to look for your utility classes.
    // Ensure all files that use Tailwind classes are included here.
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}', // For Next.js App Router
      './pages/**/*.{js,ts,jsx,tsx,mdx}', // If you're still using Pages Router or mixed
      './components/**/*.{js,ts,jsx,tsx,mdx}', // Your components folder
      './src/**/*.{js,ts,jsx,tsx,mdx}', // Your src directory (includes components, app, etc.)
    ],
    theme: {
      extend: {
        // Define custom colors, fonts, etc., here.
        colors: {
          'facebook-blue': '#1877F2',
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'], // Add Inter as a fallback or primary font
          geist: ['var(--font-geist-sans)'], // If Geist is set up via Next.js font optimization
        },
      },
    },
    plugins: [],
  };
  