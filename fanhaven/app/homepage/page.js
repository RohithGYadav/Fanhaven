'use client';

import { useState, useEffect, useRef } from 'react';
import {  signIn, signOut } from "next-auth/react"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HomeIcon, UserIcon, InformationCircleIcon, PencilSquareIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/solid';

import { AiFillLike, AiFillDislike } from 'react-icons/ai'; // Import icons from react-icons

const HomePage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allPostsSeen, setAllPostsSeen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();
  const likedPosts = useRef(new Set()); // To track liked post IDs
  const dislikedPosts = useRef(new Set()); // To track disliked post IDs
  const postRefs = useRef(new Map()); // To store references to posts
  const [username, setusername] = useState("")

  useEffect(() => {
    // Ensure session is available before proceeding
    if (status === "loading") return;
    if (!session) router.push("/login");
    if (session?.user?.email) {
      fetchUserIdAndProcessPosts(session.user.email);
    }
  }, [session]);

  // Function to fetch userId and process posts
  const fetchUserIdAndProcessPosts = async (email) => {
    try {
      // Fetch userId by passing email to the API
      const response = await fetch('/api/get-userId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch userId');
      }

      const { userId } = await response.json();

      if (userId) {
        // Process posts using the fetched userId
        processPosts(userId);

      }

      const res = await fetch('/api/get-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Send the email in the body
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch username');
      }
  
      // Parse the response to extract the username
      const { username } = await res.json();
  
      if (username) {
        // Set the fetched username to the username state
        setusername(username);
  
        // Optionally, process posts using the fetched username or userId if needed
         // If you want to process posts with username
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to process the posts with userId
  const processPosts = async (userId) => {

    const response = await fetch('/api/home-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      setPosts(data);
      markAllPostsAsSeen();

      // Initialize sets with default values (false for liked and disliked)
      data.forEach((post) => {
        if (post.likes.includes(userId)) {
          likedPosts.current.add(post._id);
        }
        if (post.dislikes.includes(userId)) {
          dislikedPosts.current.add(post._id);
        }

        // Initialize postRefs for IntersectionObserver
        postRefs.current.set(post._id, null);
      });
    }
  };



  const markPostAsSeen = async (postId) => {
    if (session) {
      try {
        await fetch('/api/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, email: session.user.email }),
        });
      } catch (error) {
        console.error('Failed to mark post as seen', error);
      }
    }
  };

  const markAllPostsAsSeen = async () => {
    if (session) {
      try {
        await fetch('/api/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });
      } catch (error) {
        console.error('Failed to mark all posts as seen', error);
      }
    }
  };

  const handleMarkAllSeen = async () => {
    await markAllPostsAsSeen();
    setAllPostsSeen(true);
    window.location.reload();
  };

  const handleLike = async (postId) => {
    const currentlyLiked = likedPosts.current.has(postId);
    const newLikedState = !currentlyLiked;

    try {
      const res = await fetch('/api/like-dislike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'like', email: session.user.email }), // Send userId directly
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
        body: JSON.stringify({ postId, action: 'dislike', email: session.user.email }), // Send userId directly
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

  const handleSearch = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length >= 1) {
      try {
        const response = await fetch('/api/search-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value }),
        });

        const data = await response.json();
        setSuggestions(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectUser = (username) => {
    router.push(`/${username}`);
  };

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = entry.target.dataset.postId;
          markPostAsSeen(postId);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    // Observe all post elements
    posts.forEach(post => {
      const element = postRefs.current.get(post._id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      // Cleanup observer
      posts.forEach(post => {
        const element = postRefs.current.get(post._id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [posts]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-black p-4 border-r border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-white">Navigation</h2>
        <div className="space-y-2 bg-gray-950 flex flex-col justify-center items-start gap-3" >
          <button
            className="flex items-center w-full text-left p-2  hover:bg-gray-800 rounded text-white text-2xl font-bold "
            onClick={() => router.push('/dashboard')}
          >
            <PencilSquareIcon className="w-6 h-6 mr-2" />
            Dashboard
          </button>
          <button
            className="flex items-center w-full text-left p-2 my-4 hover:bg-gray-800 rounded text-white text-2xl font-bold "
            onClick={() => router.push(`${username}`)}
          >
            <UserIcon className="w-6 h-6 mr-2" />
            Your Page
          </button>
          <button
            className="flex items-center w-full text-left p-2 my-4 hover:bg-gray-800 rounded text-white text-2xl font-bold "
            onClick={() => signOut("")}
          >
            <ArrowLeftEndOnRectangleIcon className="w-6 h-6 mr-2" />
            Sign Out
          </button>



          <button
            className="flex items-center w-full text-left p-2 my-4 hover:bg-gray-800 rounded text-white text-2xl font-bold "
            onClick={() => router.push('/about-us')}
          >
            <InformationCircleIcon className="w-6 h-6 mr-2" />
            About Us
          </button>
          <div className="wlc flex flex-col justify-center items-center bg-gray-900 p-2 ">
            <img src="star.png" alt="" className='w-20 ' />
            <h2 className='text-xl font-bold text-cyan-500'>Fanhaven</h2>

            <h2 className='text-white font-bold text-center text-sm'> Explore, enjoy, and interact with your favorite content and creators!</h2>
          </div>

        </div>
      </div>

      {/* Main Content - Posts Display */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
        <h1 className="text-center text-2xl font-bold mb-6">Your Feed</h1>

        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              ref={(el) => postRefs.current.set(post._id, el)}
              data-post-id={post._id}
              className="post border-2 border-gray-700 p-4 mb-4 rounded-lg shadow-md"
            >
              <div className="post-header flex items-center mb-2">
                <UserIcon className="w-8 h-8 mr-2" />
                <span className="font-semibold text-lg">{post.username}</span>
              </div>
              <div className="desc my-2">
                <p className="text-lg">{post.description}</p>
              </div>
              <div className="post-content mb-2">
                {post.type === 'image' ? (
                  <img
                    src={post.contentUrl}
                    alt="Post content"
                    className="w-full h-60 object-cover mb-2 border-2 border-cyan-600"
                  />
                ) : (
                  <video controls className="w-full h-60 object-cover mb-2 border-2 border-cyan-600">
                    <source src={post.contentUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <div className="post-footer flex justify-between items-center">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center ${likedPosts.current.has(post._id) ? 'text-blue-500' : ''
                    }`}
                >
                  <AiFillLike className="w-6 h-6" />
                  <span className="ml-2">{post.likes.length}</span>
                </button>
                <button
                  onClick={() => handleDislike(post._id)}
                  className={`flex items-center ${dislikedPosts.current.has(post._id) ? 'text-red-500' : ''
                    }`}
                >
                  <AiFillDislike className="w-6 h-6" />
                  <span className="ml-2">{post.dislikes.length}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No more posts available</p>
        )}

        {!allPostsSeen && !loading && (
          <button
            onClick={handleMarkAllSeen}
            className="w-full py-2 bg-blue-500 text-white rounded mt-4"
          >
            Mark All Posts as Seen
          </button>
        )}
      </div>

      {/* Search Functionality */}
      <div className="w-1/4 bg-black p-4 border-l border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by username..."
          className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        />
        {loading && <p>Loading...</p>}
        {suggestions.length > 0 ? (
          <ul className="list-none p-0">
            {suggestions.map((user) => (
              <li
                key={user._id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-800 rounded bg-gray-900"
                onClick={() => handleSelectUser(user.username)}
              >
                <UserIcon className="w-5 h-5 text-gray-400 mr-2" /> {/* User Icon */}
                <span>{user.username}</span> {/* Username */}
              </li>
            ))}
          </ul>
        ) : (
          searchTerm && <p className="text-gray-600">No results found.</p>
        )}
      </div>

    </div>
  );
};

export default HomePage;
