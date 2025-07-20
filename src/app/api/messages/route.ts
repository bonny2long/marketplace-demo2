import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Import your Supabase client

// Define the structure for a new message (for POST request body)
interface NewMessage {
  listing_id: string; // The ID of the listing the message is for
  buyer_email: string; // The email of the person sending the message
  seller_email: string; // The email of the listing owner
  message: string; // The content of the message
}

/**
 * GET /api/messages
 * Fetches messages related to a specific listing or user.
 * This endpoint will likely need to be refined based on how you want to display messages (e.g., all messages for a user, or messages for a specific listing).
 * For simplicity, we'll fetch messages where the buyer_email or seller_email matches the current user's email (once auth is implemented).
 * For now, it will fetch all messages for a given listing_id if provided in query params.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listing_id');
  // const userEmail = searchParams.get('user_email'); // Available if needed

  try {
    let query = supabase.from('messages').select('*');

    if (listingId) {
      query = query.eq('listing_id', listingId);
    }
    // In a real scenario with Supabase Auth, you'd get the user's email from the session:
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user?.email) {
    //   query = query.or(`buyer_email.eq.${user.email},seller_email.eq.${user.email}`);
    // } else if (userEmail) { // Fallback for testing without full auth
    //   query = query.or(`buyer_email.eq.${userEmail},seller_email.eq.${userEmail}`);
    // }

    query = query.order('created_at', { ascending: true }); // Order by creation date, oldest first

    const { data, error } = await query;

    if (error) {
      console.error('Supabase GET messages error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in GET /api/messages:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/messages
 * Creates a new message in the Supabase database.
 * Expects listing_id, buyer_email, seller_email, and message content in the request body.
 */
export async function POST(request: Request) {
  try {
    const body: NewMessage = await request.json();

    // Basic validation for required fields
    if (!body.listing_id || !body.buyer_email || !body.seller_email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields (listing_id, buyer_email, seller_email, message).' }, { status: 400 });
    }

    // Insert the new message into the 'messages' table
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          listing_id: body.listing_id,
          buyer_email: body.buyer_email,
          seller_email: body.seller_email,
          message: body.message,
        },
      ])
      .select(); // Select the newly inserted row

    if (error) {
      console.error('Supabase POST message error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Supabase insert returns an array of inserted rows
    return NextResponse.json(data[0], { status: 201 }); // Return the first (and only) inserted message
  } catch (err) {
    console.error('Unexpected error in POST /api/messages:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
