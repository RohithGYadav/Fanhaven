import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function POST(req) {
  await dbConnect();
  
  const { userId, description, contentUrl, type ,username} = await req.json();

  // Validate required fields
  if (!userId || !description || !contentUrl || !type||!username) {
    return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
  }
  console.log("username",username)

  try {
    const newPost = new Post({
      userId,
     // Using userId from the request
      type,
      contentUrl,
      description,
      username,
      isFree: true,  // Set the post as free content
    });

    await newPost.save();

    return new Response(JSON.stringify({ message: 'Post created successfully', post: newPost }), { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
