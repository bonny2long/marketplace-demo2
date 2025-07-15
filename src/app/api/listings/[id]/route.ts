import { NextRequest, NextResponse } from 'next/server'; // Use NextRequest for the request object
import { supabase } from '@/lib/supabase'; // Import your Supabase client

// Define the structure for updating a listing
interface UpdateListing {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  location?: string;
  // seller_email is used for RLS, but not typically updated via client
}

/**
 * GET /api/listings/[id]
 * Fetches a single listing by its ID from the Supabase database.
 */
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: NextRequest, // Use NextRequest, and ignore if not directly used
  { params }: { params: { id: string } } // Directly destructure and type params
) {
  const { id } = params; // Access id directly from destructured params

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id) // Filter by the provided ID
      .single(); // Expect a single row

    if (error) {
      // Check for specific Supabase error code for "no rows found" (PGRST116)
      if (error.code === 'PGRST116') {
        console.warn(`Listing with ID ${id} not found.`);
        return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
      }
      // Log other Supabase errors
      console.error(`Supabase GET listing by ID (${id}) error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If data is null (which can happen if single() finds no row but doesn't throw PGRST116 for some reason)
    if (!data) {
      console.warn(`Listing with ID ${id} not found (data is null).`);
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) { // Use 'unknown' for better type safety
    console.error(`Unexpected error in GET /api/listings/${id}:`, err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/listings/[id]
 * Updates an existing listing by its ID in the Supabase database.
 * Requires the `seller_email` claim in the JWT for Row Level Security.
 * This endpoint will require authentication to work correctly with your RLS policy.
 */
export async function PUT(
  req: NextRequest, // Use NextRequest
  { params }: { params: { id: string } } // Directly destructure and type params
) {
  const { id } = params; // Access id directly

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  try {
    const body: UpdateListing = await req.json();

    // Ensure there's something to update
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update.' }, { status: 400 });
    }

    // Attempt to update the listing. RLS will ensure only the owner can update.
    const { data, error } = await supabase
      .from('listings')
      .update(body)
      .eq('id', id)
      .select(); // Select the updated row

    if (error) {
      console.error(`Supabase PUT listing by ID (${id}) error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Listing not found or you do not have permission to update it.' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (err: unknown) { // Use 'unknown' for better type safety
    console.error(`Unexpected error in PUT /api/listings/${id}:`, err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/[id]
 * Deletes a listing by its ID from the Supabase database.
 * This endpoint will require authentication and an RLS policy for deletion to work correctly.
 */
export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: NextRequest, // Use NextRequest, and ignore if not directly used
  { params }: { params: { id: string } } // Directly destructure and type params
) {
  const { id } = params; // Access id directly

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  try {
    const { error, count } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase DELETE listing by ID (${id}) error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Listing not found or you do not have permission to delete it.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Listing deleted successfully.' }, { status: 200 });
  } catch (err: unknown) { // Use 'unknown' for better type safety
    console.error(`Unexpected error in DELETE /api/listings/${id}:`, err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
