import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';  // Ensure dbConnect is in `lib`
import User from '@/models/User';        // User model in models folder

export async function POST(req) {
  const { query } = await req.json();

  try {
    await dbConnect();

    // Find users whose usernames match the search query (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: 'i' },  // 'i' for case-insensitive search
    }).limit(10);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching for users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
