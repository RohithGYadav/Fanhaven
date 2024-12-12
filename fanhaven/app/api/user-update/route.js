import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    const formData = await request.json();

    const {
      email,
      username,
      phone,
      domain,
      bio,
      premiumCost,  // Simplified to premium cost field
      socialMediaLinks,
      razorpayId,
      razorpaySecret,
      profilePic,
      coverPic,
    } = formData;

    // Validation
    if (!email || !username) {
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 });
    }

    // Database connection
    await dbConnect();

    // Fetch user based on email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user fields
    user.username = username;
    user.phone = phone;
    user.domain = domain;
    user.bio = bio;
    user.premiumCost = premiumCost;  // Update premium cost here
    user.socialMediaLinks = socialMediaLinks;
    user.razorpayId = razorpayId;
    user.razorpaySecret = razorpaySecret;
    user.profilePic = profilePic;
    user.coverPic = coverPic;

    // Save the updated user data
    await user.save();

    // Return success message
    return NextResponse.json({ message: 'User information updated successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user information' }, { status: 500 });
  }
}
