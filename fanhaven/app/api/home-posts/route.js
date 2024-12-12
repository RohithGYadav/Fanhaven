import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';

export async function POST(req) {
  try {
    console.log('API Call Received'); // Early log to check if the API is being hit

    await dbConnect();
    console.log('DB Connected'); // Log to confirm DB connection is successful

    // Parse the JSON body of the request
    const { userId } = await req.json();
    console.log('home Received:', userId); // Log to ensure email is passed correctly

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
    }

    // Fetch user details by email
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log('User not found'); // Log if the user isn't found
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    console.log('home User found:', user); // Log user data
    // Retrieve user ID from the user document
    const following = user.following || [];
    const subscribed = user.subscribed || [];
    console.log('User following:', following);
    console.log('User subscribed:', subscribed);

    // Extract the userIds from following and subscribed arrays
    const followingIds = following.map(f => f.userId);
    const subscribedIds = subscribed.map(s => s.userId);

    // Query to fetch unseen posts
    const posts = await Post.find({
      $or: [
        { userId: { $in: followingIds }, isFree: true }, // Free posts from followed users
        { userId: { $in: subscribedIds }, isFree: false } // Paid posts from subscribed tiers
      ],
      seenBy: { $nin: [userId] } // Ensure the user hasn't seen the posts
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log('Home Fetched Posts:', posts); // Log fetched posts

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
  }
}
