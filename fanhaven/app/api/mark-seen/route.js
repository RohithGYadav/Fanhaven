import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User'; // Ensure User model is imported

export async function POST(request) {
  try {
    const { postId, email } = await request.json();

    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user._id;

    // Find the post by ID and update the seenBy array
    const result = await Post.updateOne(
      { _id: postId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    if (result.nModified === 0) {
      return NextResponse.json({ message: 'Post already marked as seen' });
    }

    return NextResponse.json({ message: 'Post marked as seen' });
  } catch (error) {
    console.error('Error marking post as seen:', error);
    return NextResponse.json({ error: 'Failed to mark post as seen' }, { status: 500 });
  }
}
