// File: app/api/get-userId/route.js

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  await dbConnect();

  try {
    const { email } = await req.json(); // Fetch data from the request body

    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ userId: user._id }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching userId:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}
