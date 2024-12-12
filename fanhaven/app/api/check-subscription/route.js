import dbConnect from '@/lib/dbConnect';  // Ensure you have this function set up for database connection
import User from '@/models/User';  // Your User model
import { getServerSession } from 'next-auth/next';

export async function POST(req, res) {
  await dbConnect();  // Connect to the database

  const session = await getServerSession({ req });
  if (!session) {
    console.error('Session not found.');
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const { ownerUserId } = await req.json();  // Parse the request body for JSON data
  const currentUserEmail = session.user.email;

  try {
    // Find the current user by email to get their userId
    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return new Response(JSON.stringify({ success: false, message: 'Current user not found' }), { status: 404 });
    }

    // Find the owner user by userId (the user whose followers we are checking)
    const ownerUser = await User.findById(ownerUserId);
    if (!ownerUser) {
      return new Response(JSON.stringify({ success: false, message: 'Owner user not found' }), { status: 404 });
    }

    // Find the follower entry for the current user in the owner user's followers list
    const follower = ownerUser.followers.find(follow => follow.userId.toString() === currentUser._id.toString());

    if (follower) {
      // Check if the subscription is active
      if (follower.subscribed) {
        // Check if the subscription has expired
        const currentDate = new Date();
        if (follower.expiryDate && currentDate > new Date(follower.expiryDate)) {
          // Subscription has expired
          follower.subscribed = false;
          follower.expiryDate = null;  // Clear the expiration date
          await ownerUser.save();  // Save the changes to the ownerUser document

          return new Response(JSON.stringify({ success: false, message: 'Subscription has expired.' }), { status: 403 });
        }

        // Subscription is active
        return new Response(JSON.stringify({ success: true, message: 'User is subscribed.' }), { status: 200 });
      } else {
        // Subscription is not active
        return new Response(JSON.stringify({ success: false, message: 'User is not subscribed.' }), { status: 403 });
      }
    } else {
      // User is not a follower
      return new Response(JSON.stringify({ success: false, message: 'User is not subscribed.' }), { status: 403 });
    }

  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
