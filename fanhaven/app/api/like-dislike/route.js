import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';

export async function POST(request) {
  await dbConnect();

  try {
    const { postId, action, userId, email } = await request.json();

    // Find the userId if userId is null
    let finalUserId = userId;
    if (!finalUserId && email) {
      const user = await User.findOne({ email });
      if (user) {
        finalUserId = user._id.toString(); // Convert ObjectId to string
      } else {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
    }

    if (!finalUserId) {
      return NextResponse.json({ message: 'User ID or email is required' }, { status: 400 });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Update likes and dislikes based on action
    if (action === 'like') {
      // Remove user from dislikes if already disliked
      if (post.dislikes.includes(finalUserId)) {
        post.dislikes.pull(finalUserId);
      }
      // Add user to likes if not already liked
      if (!post.likes.includes(finalUserId)) {
        post.likes.push(finalUserId);
      } else {
        post.likes.pull(finalUserId);
      }
    } else if (action === 'dislike') {
      // Remove user from likes if already liked
      if (post.likes.includes(finalUserId)) {
        post.likes.pull(finalUserId);
      }
      // Add user to dislikes if not already disliked
      if (!post.dislikes.includes(finalUserId)) {
        post.dislikes.push(finalUserId);
      } else {
        post.dislikes.pull(finalUserId);
      }
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Save the updated post
    const updatedPost = await post.save();

    return NextResponse.json({ message: 'Success', post: updatedPost });
  } catch (error) {
    console.error('Error processing like/dislike:', error);
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}
