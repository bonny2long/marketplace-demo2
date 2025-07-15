import { NextRequest, NextResponse } from 'next/server';
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

// Reusable context type
type RouteContext = { params: { id: string } };

/**
 * GET /api/listings/[id]
 * Fetches a single listing by its ID from the Supabase database.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`Listing with ID ${id} not found.`);
        return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
      }
      console.error(`Supabase GET listing by ID (${id}) error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.warn(`Listing with ID ${id} not found (data is null).`);
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
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
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
  }

  try {
    const body: UpdateListing = await request.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('listings')
      .update(body)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Supabase PUT listing by ID (${id}) error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Listing not found or you do not have permission to update it.' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (err: unknown) {
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
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = params;

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
  } catch (err: unknown) {
    console.error(`Unexpected error in DELETE /api/listings/${id}:`, err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
