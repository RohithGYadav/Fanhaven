import dbConnect from '@/lib/dbConnect';  // Ensure you have this function set up for database connection
import User from '@/models/User';  // Your User model
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the session to access the logged-in user's email
    const session = await getServerSession({ req });
    if (!session) {
      console.error('Session not found.');
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    // Parse the request body to get the ownerUserId (the user being checked)
    const { ownerUserId } = await req.json();

    // Get the current user's email from the session
    const currentUserEmail = session.user.email;

    // Find the current user by email to get their userId
    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return new Response(JSON.stringify({ success: false, message: 'Current user not found' }), { status: 404 });
    }

    // Find the owner user by their userId (the user whose followers we're checking)
    const ownerUser = await User.findById(ownerUserId);
    if (!ownerUser) {
      return new Response(JSON.stringify({ success: false, message: 'Owner user not found' }), { status: 404 });
    }

    // Check if the currentUser's ID is in the ownerUser's followers list with subscribed: true
    const isSubscribed = ownerUser.followers.some(follower => 
      follower.userId.toString() === currentUser._id.toString() 
    );

    // Return the response based on whether the current user is following the owner user
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
