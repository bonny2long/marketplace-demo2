import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Import your Supabase client

// Define the structure for a new listing (for POST request body)
interface NewListing {
  title: string;
  description: string;
  price: number;
  category: string;
  seller_email: string;
  image_url?: string; // Optional, as it might be handled by a separate upload
  location?: string;
}

/**
 * GET /api/listings
 * Fetches all listings from the Supabase database.
 * Can be extended later to support search and filtering.
 */
export async function GET(_request: Request) { // Changed 'request' to '_request'
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*') // Select all columns
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (error) {
      console.error('Supabase GET listings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in GET /api/listings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/listings
 * Creates a new listing in the Supabase database.
 * Expects listing details in the request body.
 */
export async function POST(request: Request) { // Reverted to 'request' as it is used
  try {
    const body: NewListing = await request.json(); // Use 'request' here

    // Basic validation for required fields
    if (!body.title || !body.price || !body.category || !body.seller_email) {
      return NextResponse.json({ error: 'Missing required fields (title, price, category, seller_email).' }, { status: 400 });
    }

    // Insert the new listing into the 'listings' table
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          title: body.title,
          description: body.description,
          price: body.price,
          category: body.category,
          seller_email: body.seller_email,
          image_url: body.image_url,
          location: body.location,
        },
      ])
      .select(); // Select the newly inserted row

    if (error) {
      console.error('Supabase POST listing error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Supabase insert returns an array of inserted rows
    return NextResponse.json(data[0], { status: 201 }); // Return the first (and only) inserted item
  } catch (err) {
    console.error('Unexpected error in POST /api/listings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
