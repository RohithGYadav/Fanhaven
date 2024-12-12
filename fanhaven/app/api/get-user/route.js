// pages/api/get-user.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Tier from '@/models/Tier';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    if (!username && !email) {
      return NextResponse.json({ error: 'Username or email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne(
      username ? { username } : { email }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tiers = await Tier.find({ userId: user._id }).lean();

    const userWithTiers = {
      ...user,
      tiers,
    };

    return NextResponse.json(userWithTiers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
