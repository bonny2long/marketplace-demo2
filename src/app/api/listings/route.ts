import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface NewListing {
  title: string;
  description: string;
  price: number;
  category: string;
  seller_email: string;
  image_url?: string;
  location?: string;
}

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase GET listings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error('Unexpected error in GET /api/listings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: NewListing = await request.json();
    if (!body.title || !body.price || !body.category || !body.seller_email) {
      return NextResponse.json({ error: 'Missing required fields (title, price, category, seller_email).' }, { status: 400 });
    }
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
      .select();
    if (error) {
      console.error('Supabase POST listing error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: unknown) {
    console.error('Unexpected error in POST /api/listings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}