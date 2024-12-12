// /app/api/delete/route.js
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { postId } = body;

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}
