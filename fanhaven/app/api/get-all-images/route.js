// pages/api/get-all-images.js

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
export default async function handler(req, res) {
  await dbConnect();

  try {
    const users = await User.find({}); // Fetch all users
    const images = users.flatMap(user => user.posts.map(post => ({ url: post.imageUrl }))); // Adjust based on your schema

    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
}
