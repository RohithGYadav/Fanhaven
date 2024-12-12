import { NextResponse } from 'next/server';
import Post from '@/models/Post'; // Adjust path to your Post model
import User from '@/models/User'; // Adjust path to your User model
import dbConnect from '@/lib/dbConnect'; // Adjust path to your DB connection
import { getServerSession } from 'next-auth/next';

export async function POST(req) {
  try {
    const { pageUserId } = await req.json();

    // Assuming you're using a session middleware and have access to session data
    const session = await getServerSession({ req });
    if (!session) {
      console.error('Session not found.');
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
    }; // Use your session method to get session data
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    await dbConnect();

    // Find the user by their email to get their userId
    const currentUser = await User.findOne({ email: userEmail }).lean();
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    

    const sessionUserId = currentUser._id;
    console.log("Reqqq",sessionUserId)

    // Fetch all posts from the followed page, ordered by the most recent
    const posts = await Post.find({ userId: pageUserId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean();

    if (posts.length <= 3) {
      // If there are 3 or fewer posts, no need to mark anything as seen
      return NextResponse.json({ message: 'Less than 3 posts, no posts marked as seen' }, { status: 200 });
    }

    // Get all posts except the most recent 3
    const postsToMarkSeen = posts.slice(3); // Everything except the first 3 posts

    // Update the seenBy field for those posts, adding the session user's ID
    await Post.updateMany(
      { _id: { $in: postsToMarkSeen.map(post => post._id) } }, // Get post IDs to update
      { $addToSet: { seenBy: sessionUserId } } // Add current user's ID to seenBy field
    );

    return NextResponse.json({ message: 'Older posts marked as seen' }, { status: 200 });
  } catch (error) {
    console.error('Error marking posts as seen:', error);
    return NextResponse.json({ message: 'Error marking posts as seen' }, { status: 500 });
  }
}
