import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req) {
  await dbConnect(); // Connect to the database

  const { searchParams } = req.nextUrl;
  const username = searchParams.get('username');
  const currentUsername = searchParams.get('currentUsername');

  if (!username) {
    return new Response(
      JSON.stringify({ success: false, message: 'Username is required' }),
      { status: 400 }
    );
  }

  try {
    // If the username is the same as the currentUsername, it's valid
    if (username === currentUsername) {
      return new Response(
        JSON.stringify({ success: true, available: true }),
        { status: 200 }
      );
    }

    // Otherwise, check if the username is already taken
    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: true, available: false }), 
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, available: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking username availability:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 }
    );
  }
}
