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

    // Extract userIds from subscribed
    const subscribedIds = ownerUser.subscribed.map(sub => sub.userId); // Extract userId from each object
    console.log("Subscribed userIds:", subscribedIds);

    // Find all users whose _id matches the ids in subscribedIds
    const subscribed = await User.find({ _id: { $in: subscribedIds } }).select('_id username profilePic');

    // Format the response
    const formattedSubscribed = subscribed.map(user => ({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
    }));

    return new Response(JSON.stringify({ success: true, subscribed: formattedSubscribed }), { status: 200 });
  } catch (error) {
    console.error('Error fetching subscribed:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
