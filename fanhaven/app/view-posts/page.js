"use client"; // Add this at the top

import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from 'react';
import { AiFillLike, AiFillDislike, AiFillDelete } from 'react-icons/ai'; // Import icons from react-icons
import { HomeIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const ViewPosts = () => {
  const searchParams = useSearchParams();
  const index = parseInt(searchParams.get('index'), 10); // Get the index parameter
  const isOwnPage = searchParams.get('isOwnPage') === 'true'; // Check if it's the user's own page
  const userId = searchParams.get('userId'); // User ID of the current user
  const [posts, setPosts] = useState([]);
  const postRefs = useRef([]);
  const likedPosts = useRef(new Set()); // To track liked post IDs
  const dislikedPosts = useRef(new Set()); // To track disliked post IDs
  const initialLoad = useRef(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Retrieve the posts from localStorage
    if (status === "loading") return;
    if (!session) router.push("/login");
    const storedPosts = JSON.parse(localStorage.getItem('posts'));
    if (storedPosts) {
      setPosts(storedPosts);
      // Initialize sets with default values (false for liked and disliked)
      storedPosts.forEach(post => {
        if (post.likes.includes(userId)) {
          likedPosts.current.add(post._id);
        }
        if (post.dislikes.includes(userId)) {
          dislikedPosts.current.add(post._id);
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    // Scroll to the clicked post when the component loads
    if (initialLoad.current && index !== undefined && postRefs.current[index]) {
      postRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      initialLoad.current = false; // Ensure it only scrolls once on initial load or index change
    }
  }, [posts, index]);

  const handleLike = async (postId) => {
    const currentlyLiked = likedPosts.current.has(postId);
    const newLikedState = !currentlyLiked;

    try {
      const res = await fetch('/api/like-dislike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'like', userId }), // Send userId directly
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post._id === postId ? updatedPost.post : post))
        );
        // Update liked state
        if (newLikedState) {
          likedPosts.current.add(postId);
          dislikedPosts.current.delete(postId);
        } else {
          likedPosts.current.delete(postId);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async (postId) => {
    const currentlyDisliked = dislikedPosts.current.has(postId);
    const newDislikedState = !currentlyDisliked;

    try {
      const res = await fetch('/api/like-dislike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'dislike', userId }), // Send userId directly
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post._id === postId ? updatedPost.post : post))
        );
        // Update disliked state
        if (newDislikedState) {
          dislikedPosts.current.add(postId);
          likedPosts.current.delete(postId);
        } else {
          dislikedPosts.current.delete(postId);
        }
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const renderPostContent = () => {
    if (!posts || posts.length === 0) {
      return <p>No posts to display.</p>;
    }
  
    return posts.map((post, idx) => (
      <div
        key={idx}
        ref={(el) => (postRefs.current[idx] = el)} // Attach a ref to each post element
        className="w-3/5 mx-auto my-4 border-2 border-x-gray-950 border-y-gray-600 bg-gray-950 pb-4 rounded-md"
      >
        <div className="flex items-center mb-4 p-1 rounded-md">
          <UserIcon className="w-5 h-5 text-gray-400 m-2" />
          <h3 className="text-lg font-semibold text-white m-2">{post.username}</h3>
        </div>
        <div className="desc m-6">
          <p className="text-gray-300">{post.description || 'No description available'}</p>
        </div>
        <div className="relative w-full bg-gray-950 flex items-center justify-center mb-4 p-2">
          {post.type === 'image' && (
            <img
              src={post.contentUrl}
              alt={`Post ${idx}`}
              className="object-contain max-w-full max-h-96 border-2 border-cyan-600 rounded-md"
              style={{ maxWidth: '100%', maxHeight: '24rem' }}
            />
          )}
          {post.type === 'video' && (
            <video controls className="w-full max-h-96" style={{ maxHeight: '24rem' }}>
              <source src={post.contentUrl} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="flex items-center w-full mt-4 justify-around">
  <div className="flex flex-col items-center space-y-2">
    <AiFillLike
      className={`text-2xl ${likedPosts.current.has(post._id) ? 'text-blue-500' : 'text-yellow-400'} hover:text-blue-800 cursor-pointer`}
      onClick={() => handleLike(post._id)}
    />
    <span className="text-sm text-gray-600">{post.likes.length || 0} Likes</span>
  </div>
  <div className="flex flex-col items-center space-y-2">
    <AiFillDislike
      className={`text-2xl ${dislikedPosts.current.has(post._id) ? 'text-red-800' : 'text-red-600'} hover:text-red-800 cursor-pointer`}
      onClick={() => handleDislike(post._id)}
    />
    <span className="text-sm text-gray-600">{post.dislikes.length || 0} Dislikes</span>
  </div>
  {isOwnPage && (
    <div className="flex flex-col items-center space-y-2">
      <AiFillDelete
        className="text-2xl text-gray-600 hover:text-gray-800 cursor-pointer"
        onClick={() => handleDelete(post._id)}
      />
      <span className="text-sm text-gray-600">Delete</span>
    </div>
  )}
</div>

      </div>
    ));
  };
  

  return (
    <div>
      {renderPostContent()}
    </div>
  );
};

export default ViewPosts;
