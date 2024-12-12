import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
   
    if (!userId ) {
      console.log("Missing query parameters:", { userId });
      return NextResponse.json(
        { message: "Missing required query parameters" },
        { status: 400 }
      );
    }

    // Validate ObjectId instances
    if (!mongoose.isValidObjectId(userId)) {
      console.log("Invalid userId :", { userId });
      return NextResponse.json(
        { message: "Invalid userId or tierId" },
        { status: 400 }
      );
    }

    // Fetch posts for the specified userId and tierId
    const posts = await Post.find({
      userId: userId,
      isFree: false
    }).exec();

    console.log("Found posts:", posts);

    // Return the posts with a 200 status
    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error fetching paid content:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
