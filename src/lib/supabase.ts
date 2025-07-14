import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables.
// These should be defined in your .env.local file in the project root.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure that environment variables are set
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Remember to add these to your .env.local file in the project root:
// NEXT_PUBLIC_SUPABASE_URL="https://mwzkfyjnmtfpuzhaijjt.supabase.co"
// NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13emtmeWpubXRmcHV6aGFpamp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxOTYxMzMsImV4cCI6MjA2Nzc3MjEzM30.o6Bi0cjL_vLUh9366YawDjpwc6xHZ1_mR1oQuID5bmY"
