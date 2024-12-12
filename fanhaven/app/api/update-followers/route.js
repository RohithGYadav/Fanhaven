import dbConnect from '@/lib/dbConnect';  // Ensure you have this function set up for database connection
import User from '@/models/User';  // Your User model
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  await dbConnect();  // Connect to the database

  const session = await getServerSession({ req });
  if (!session) {
    console.error('Session not found.');
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }

  const { ownerUserId } = await req.json();
  if (!ownerUserId) {
    console.log("No ownerUserId provided");
    return new Response(JSON.stringify({ success: false, message: 'Owner user ID required' }), { status: 400 });
  }

  const currentUserEmail = session.user.email;

  try {
    // Find the current user by email
    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      console.log("Current user not found");
      return new Response(JSON.stringify({ success: false, message: 'Current user not found' }), { status: 404 });
    }

    // Find the target user by userId
    const targetUser = await User.findById(ownerUserId);
    if (!targetUser) {
      console.log("Target user not found");
      return new Response(JSON.stringify({ success: false, message: 'Target user not found' }), { status: 404 });
    }

    // Calculate the expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Check if the current user is already in the target user's followers list
    const existingFollower = targetUser.followers.find(follow => follow.userId.toString() === currentUser._id.toString());

    if (existingFollower) {
      // Update existing follower's subscription status and expiry date
      existingFollower.subscribed = true;
      console.log("expires:",expiryDate)
      existingFollower.expiryDate = expiryDate;
    } else {
      // Add new follower entry with expiry date
      targetUser.followers.push({ userId: currentUser._id, subscribed: true, expiryDate });
    }

    await targetUser.save();

    return new Response(JSON.stringify({ success: true, message: 'Target user\'s followers updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error updating followers:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
