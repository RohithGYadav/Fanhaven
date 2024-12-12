import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  try {
    await dbConnect();

    const session = await getServerSession({ req });
    if (!session) {
      console.error('Session not found.');
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      console.error('User ID not provided.');
      return new Response(JSON.stringify({ message: 'User ID is required' }), { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      console.error('Current user not found.');
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      console.error('Target user not found.');
      return new Response(JSON.stringify({ message: 'Target user not found' }), { status: 404 });
    }

    const isFollowing = currentUser.following.some(follow => follow.userId.toString() === userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(follow => follow.userId.toString() !== userId);
      await currentUser.save();

      targetUser.followers = targetUser.followers.filter(follower => follower.userId.toString() !== currentUser._id.toString());
      await targetUser.save();

      console.log('Successfully unfollowed the user.');
      return new Response(JSON.stringify({ message: 'Successfully unfollowed' }), { status: 200 });
    } else {
      // Follow
      currentUser.following.push({ userId });
      await currentUser.save();

      const followerData = {
        userId: currentUser._id,
        subscribed: false
      };

      targetUser.followers.push(followerData);
      await targetUser.save();

      console.log('Successfully followed the user.');
      return new Response(JSON.stringify({ message: 'Successfully followed' }), { status: 200 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ message: 'Server error', error }), { status: 500 });
  }
}
