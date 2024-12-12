import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    console.log("Starting GET request handler...");

    await dbConnect();
    console.log("Database connected successfully.");

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type');

    console.log("Request URL:", request.url);
    console.log("Query Parameters: userId =", userId, "type =", type);

    if (!userId || !type) {
      console.log("Missing query parameters:", { userId, type });
      return NextResponse.json(
        { message: "Missing required query parameters" },
        { status: 400 }
      );
    }

    // Validate ObjectId instances
    if (!mongoose.isValidObjectId(userId)) {
      console.log("Invalid userId:", { userId });
      return NextResponse.json(
        { message: "Invalid userId" },
        { status: 400 }
      );
    }

    // Query using ObjectId instances and sort by createdAt in descending order
    const posts = await Post.find({
      userId: userId,
      isFree: true,
    })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();

    console.log("Found posts:", posts);

    // Return empty array with 200 status if no posts found
    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error fetching free content:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
