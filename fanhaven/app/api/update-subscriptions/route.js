import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  await dbConnect();

  const session = await getServerSession({ req });
  if (!session) {
    console.error('Session not found.');
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }

  const { targetUserId } = await req.json();
  const currentUserEmail = session.user.email;

  try {
    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return new Response(JSON.stringify({ success: false, message: 'Current user not found' }), { status: 404 });
    }

    // Check if the target user is already in the current user's subscribed list
    const isAlreadySubscribed = currentUser.subscribed.some(sub => sub.userId.toString() === targetUserId.toString());
    if (isAlreadySubscribed) {
      return new Response(JSON.stringify({ success: false, message: 'Already subscribed' }), { status: 400 });
    }

    // Add target user to current user's subscribed list
    currentUser.subscribed.push({ userId: targetUserId });
    await currentUser.save();

    return new Response(JSON.stringify({ success: true, message: 'Current user\'s subscriptions updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error updating subscriptions:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
