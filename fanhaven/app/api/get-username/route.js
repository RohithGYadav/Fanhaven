import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Assuming you have a database connection utility
import User from '@/models/User'; // Import your User model

// Fetch username based on userId
export async function POST(request) {
  try {
    // Parse the request body
    const { email } = await request.json();

    // Check if userId is provided
    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();

    // Find the user by userId
    const user = await User.findOne({email});

    // If user not found, return an error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the username
    return NextResponse.json({ username: user.username }, { status: 200 });

  } catch (error) {
    console.error('Error fetching username:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
