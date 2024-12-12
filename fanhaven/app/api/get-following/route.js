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

    // Extract userIds from following
    const followingIds = ownerUser.following.map(follow => follow.userId); // Extract userId from each object
    console.log("Following userIds:", followingIds);

    // Find all users whose _id matches the ids in followingIds
    const following = await User.find({ _id: { $in: followingIds } }).select('_id username profilePic');

    // Format the response
    const formattedFollowing = following.map(user => ({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
    }));

    return new Response(JSON.stringify({ success: true, following: formattedFollowing }), { status: 200 });
  } catch (error) {
    console.error('Error fetching following:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
