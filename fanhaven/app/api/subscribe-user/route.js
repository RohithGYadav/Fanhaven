import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  await dbConnect();

  const session = await getServerSession({ req });
  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const { followUserId } = await req.json(); // Get the user ID to follow from the request body

  try {
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    // Check if the user is already following the target user
    if (currentUser.following.includes(followUserId)) {
      return new Response(JSON.stringify({ message: 'Already following this user' }), { status: 400 });
    }

    // Add the user to the following list
    currentUser.following.push(followUserId);
    await currentUser.save();

    return new Response(JSON.stringify({ message: 'User followed successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Server error', error }), { status: 500 });
  }
}
