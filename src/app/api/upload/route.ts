import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Import your Supabase client
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

/**
 * POST /api/upload
 * Handles image uploads to Supabase Storage.
 * Expects a FormData object containing image files.
 */
export async function POST(request: Request) {
  try {
    // Check if the request content type is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid Content-Type. Expected multipart/form-data.' }, { status: 415 });
    }

    const formData = await request.formData();
    const uploadedFileUrls: string[] = [];

    // Iterate over all files in the FormData
    for (const [_, value] of formData.entries()) { // Changed 'key' to '_'
      if (value instanceof Blob) { // Check if the value is a File (which is a Blob)
        const file = value as File;

        // Basic validation: ensure it's an image and has a name
        if (!file.type.startsWith('image/') || !file.name) {
          console.warn(`Skipping non-image file or file without name: ${file.name || 'unknown'}`);
          continue; // Skip non-image files or files without a name
        }

        // Generate a unique file name to prevent collisions
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;

        // Convert Blob to ArrayBuffer for Supabase upload
        const arrayBuffer = await file.arrayBuffer();

        // Upload the file to the 'listing-images' bucket
        const { data: uploadData, error } = await supabase.storage // Renamed 'data' to 'uploadData'
          .from('listing-images') // Your bucket name
          .upload(uniqueFileName, arrayBuffer, {
            contentType: file.type,
            upsert: false, // Do not overwrite existing files
          });

        if (error) {
          console.error(`Supabase upload error for ${file.name}:`, error);
          return NextResponse.json({ error: `Failed to upload ${file.name}: ${error.message}` }, { status: 500 });
        }

        // The 'uploadData' variable is not directly used after this, but its existence is fine.
        // It's common to destructure 'data' even if only 'error' is immediately checked.

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(uniqueFileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          uploadedFileUrls.push(publicUrlData.publicUrl);
        } else {
          console.warn(`Could not get public URL for ${uniqueFileName}`);
        }
      }
    }

    if (uploadedFileUrls.length === 0) {
      return NextResponse.json({ error: 'No valid image files received.' }, { status: 400 });
    }

    return NextResponse.json({ urls: uploadedFileUrls }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in POST /api/upload:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
