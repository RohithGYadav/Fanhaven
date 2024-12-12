import dbConnect from '@/lib/dbConnect';  // Ensure you have this function set up for database connection 
import User from '@/models/User';  // Your User model

export async function GET(req) {
  await dbConnect();  // Connect to the database

  const { searchParams } = req.nextUrl;
  const ownerUserId = searchParams.get('ownerUserId');

  if (!ownerUserId) {
    return new Response(JSON.stringify({ success: false, message: 'ownerUserId is required' }), { status: 400 });
  }

  try {
    // Find the owner user by userId
    const ownerUser = await User.findById(ownerUserId);
    if (!ownerUser) {
      return new Response(JSON.stringify({ success: false, message: 'Owner user not found' }), { status: 404 });
    }

    // Extract userIds from followers
    const followerIds = ownerUser.followers.map(f => f.userId);

    // Find all users whose _id matches the ids in followerIds
    const followers = await User.find({ _id: { $in: followerIds } }).select('_id username profilePic');

    // Format the response
    const formattedFollowers = followers.map(user => ({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      isSubscribed: ownerUser.followers.find(f => f.userId.toString() === user._id.toString()).subscribed,
    }));

    return new Response(JSON.stringify({ success: true, followers: formattedFollowers }), { status: 200 });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
