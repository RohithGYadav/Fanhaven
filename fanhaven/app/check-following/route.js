import dbConnect from '@/lib/dbConnect';  // Ensure you have this function set up for database connection
import User from '@/models/User';  // Your User model
import { getServerSession } from 'next-auth/next';

export async function POST(req, res) {
  // Connect to the database
  await dbConnect();

  // Get the session of the current user
  const session = await getServerSession({ req });
  if (!session) {
    console.error('Session not found.');
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  // Parse request body to get the owner user ID
  const { ownerUserId } = await req.json();  
  const currentUserEmail = session.user.email;

  try {
    // Find the current user by email to retrieve their user ID
    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return new Response(JSON.stringify({ success: false, message: 'Current user not found' }), { status: 404 });
    }

    // Find the owner user by their user ID (the owner of the page)
    const ownerUser = await User.findById(ownerUserId);
    if (!ownerUser) {
      return new Response(JSON.stringify({ success: false, message: 'Owner user not found' }), { status: 404 });
    }

    // Check if the current user's ID is in the owner user's followers list and has subscribed
    const isSubscribed = ownerUser.followers.some(follow => 
      follow.userId.toString() === currentUser._id.toString() && follow.subscribed === true
    );

    // Return success if the user is following the owner
    if (isSubscribed) {
      return new Response(JSON.stringify({ success: true, message: 'User is subscribed.' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'User is not subscribed.' }), { status: 403 });
    }

  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
