import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function POST(req) {
  await dbConnect();
  
  const { userId, description, contentUrl, type ,username} = await req.json();

  // Validate required fields
  if (!userId || !description || !contentUrl || !type||!username) {
    return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
  }
  // Validate ObjectId instances
  if (!mongoose.isValidObjectId(userId) ) {
    return new NextResponse(JSON.stringify({ message: 'Invalid userId or tierId' }), { status: 400 });
  }

  try {
    const newPost = new Post({
      userId,  // Using userId from the request
      type,
      contentUrl,
      username,
      description,
   
      isFree: false,  // Set the post as paid content
    });

    await newPost.save();

    return new NextResponse(JSON.stringify({ message: 'Post created successfully', post: newPost }), { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
