"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import { FaInstagram, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';

const Username = ({ params }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState(null);

  const [isMyPage, setIsMyPage] = useState(false);

  const [freeContent, setFreeContent] = useState([]);
  const [paidContent, setPaidContent] = useState([]);
  const [activeContent, setActiveContent] = useState("all");
  const [activeContentPaid, setActiveContentPaid] = useState("all");

  const [userId, setUserId] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState({});
  const [addFreePost, setAddFreePost] = useState(false);
  const [addPaidPost, setAddPaidPost] = useState(false);
  const [freePostDescription, setFreePostDescription] = useState("");
  const [paidPostDescription, setPaidPostDescription] = useState("");
  const [freePostMedia, setFreePostMedia] = useState(null);
  const [paidPostMedia, setPaidPostMedia] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActivetab] = useState("free");
  const [isSubscribed, setisSubscribed] = useState(false);
 
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [subscribed, setSubscribed] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);



  // UseEffect for session check
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    } else if (params.username !== session?.user?.username) {
      fetchUserData();  // Ensure fetchUserData runs when session and params are available
    }
  }, [session, status, router, params.username]);

  // Fetch user data and ensure userId and subscription status are set before fetching content
  const fetchUserData = async () => {
    try {
      const username = params.username;  // Make sure params.username is correctly set
      const response = await axios.get(`/api/get-user?username=${username}`);
      const user = response.data;

      // Update userId and userData
      setUserId(user._id);
      setUserData(user);

      if (session && user.email === session.user.email) {
        setIsMyPage(true);
      }

      // Fetch free content once user data is available
      fetchFreeContent(user._id, "all");

      // After setting userId, check subscription and fetch paid content
      console.log(user._id)
      await checkifFollowed(user._id);
      console.log("Ok Callingg")
      await checkIfSubscribed(user._id);  // Pass userId to subscription check
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Subscription check and fetch paid content based on subscription
  const checkIfSubscribed = async (userId) => {
    if(isMyPage){
      setisSubscribed(true)
      await fetchPaidContent(userId);
    }
    else{
    try {
      const response = await axios.post('/api/check-subscription', {
        ownerUserId: userId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const isUserSubscribed = response.data.success;
      console.log("Yovv:",isMyPage)
      
       setisSubscribed(isUserSubscribed);
      console.log("isSub:", isUserSubscribed); // Use isUserSubscribed directly

      // Fetch paid content only if user is subscribed
      if (isUserSubscribed) {  // Use the value directly from the response
        console.log("Calling fetchPaidContent...");
        await fetchPaidContent(userId);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }}
  };
  const checkifFollowed = async (userId) => {
    try {
      const response = await axios.post('/api/check-follow', {
        ownerUserId: userId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const isUserfollowed = response.data.success;
      setIsFollowing(isUserfollowed);
      console.log("isFollow:", isUserfollowed); // Use isUserSubscribed directly

    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  // Fetch paid content
  const fetchPaidContent = async (userId) => {
    try {
      if (!userId) {
        console.warn("Missing required parameters or not subscribed:", { userId, isSubscribed });
        return;
      }
      console.log("Received...")

      const response = await axios.get(`/api/get-paid-content?userId=${userId}`);
      const fetchedContent = response.data;

      if (fetchedContent.length === 0) {
        alert("No content found for the given parameters.");
        setPaidContent([]);
      } else {
        alert("Paid succ")

        setPaidContent(fetchedContent);  // Update the state with fetched content
      }
    } catch (error) {
      console.error("Error fetching paid content:", error);

      // Handle specific error responses
      if (error.response) {
        if (error.response.status === 403) {
          alert("You need to subscribe to view this content.");  // Show a user-friendly message
        } else {
          alert("An error occurred while fetching the content. Please try again later.");
        }
      } else if (error.request) {
        alert("Network error. Please check your connection.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };





  const fetchFreeContent = async (userId, type) => {
    try {

      const response = await axios.get(`/api/get-free-content?userId=${userId}&type=${type}`);
      console.log("res:", response);
      setFreeContent(response.data);
      console.log("AA", freeContent);
    } catch (error) {
      console.error("Error fetching free content:", error);
    }
  };





  const renderPaidContent = () => {
    
    if (isSubscribed||isMyPage) {
      if (paidContent.length === 0) {
        return isMyPage ? (
          <div>
            No paid content available.
          </div>
        ) : (
          <div>No Content Yet!</div>
        );
      }

      const handlePostClick = (index) => {
        // Store the freeContent data in localStorage (or use a context)
        localStorage.setItem('posts', JSON.stringify(paidContent));
  
        // Get the username from userdata
        const username = userData.username;
        
  
        // Navigate to the view-posts page with both index and username as query parameters
        router.push(`/view-posts?index=${index}&username=${username}&userId=${userId}&isOwnPage=${isMyPage}`);
      };

      return (
        <div className="grid grid-cols-3 gap-4">
          {paidContent.map((post, index) => {
            // Render all content if activeContent is 'all'
            if (activeContentPaid === "all") {
              return (
                <div 
                  key={post._id} 
                  className="content-item cursor-pointer overflow-hidden border-2 border-cyan-500"
                  onClick={() => handlePostClick(index)}
                  style={{ width: '100%', height: '14rem' }} // Set dimensions
                >
                  {post.type === "image" && post.contentUrl && (
                    <img 
                      src={post.contentUrl} 
                      alt={post.description} 
                      className="w-full h-full object-cover"  // Ensure it fills the container while cropping overflow
                    />
                  )}
                  {post.type === "video" && post.contentUrl && (
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                    >
                      <source src={post.contentUrl} type="video/mp4" />
                    </video>
                  )}
                </div>
              );
            }
      
            // Render only images if activeContent is 'images'
            if (activeContentPaid === "images" && post.type === "image") {
              return (
                <div 
                  key={post._id} 
                  onClick={() => handlePostClick(index)}
                  className="content-item cursor-pointer overflow-hidden border-2 border-cyan-500"
                  style={{ width: '100%', height: '14rem' }} // Set dimensions
                >
                  <img 
                    src={post.contentUrl} 
                    alt={post.description} 
                    className="w-full h-full object-cover"  // Ensure it fills the container while cropping overflow
                  />
                </div>
              );
            }
      
            // Render only videos if activeContent is 'videos'
            if (activeContentPaid === "videos" && post.type === "video") {
              return (
                <div 
                  key={post._id} 
                  onClick={() => handlePostClick(index)}
                  className="content-item cursor-pointer overflow-hidden border-2 border-cyan-500"
                  style={{ width: '100%', height: '14rem' }} // Set dimensions
                >
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                  >
                    <source src={post.contentUrl} type="video/mp4" />
                  </video>
                </div>
              );
            }
      
            return null; // Skip rendering if the post doesn't match the active content filter
          })}
        </div>
      );
      
    }
    else {
      return (
        <>
        <div className=" flex flex-col justify-center items-center">
          <div>Please Subscribe!</div>
          <button className=" bg-blue-600 p-2" onClick={() => { handleSubscription() }}>Pay</button>
          </div>
        </>
      )
    }
  };

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        const unfollowResponse = await axios.post('/api/follow-user', { userId });
  
        if (unfollowResponse.status === 200) {
          setIsFollowing(false);
          console.log('Successfully unfollowed the user.');
        } else {
          console.error('Error unfollowing user:', unfollowResponse);
        }
      } else {
        // Follow
        const followResponse = await axios.post('/api/follow-user', { userId });
  
        if (followResponse.status === 200) {
          setIsFollowing(true);
          const markPostsResponse = await axios.post('/api/update-seenby', { userId });
  
          if (markPostsResponse.status !== 200) {
            console.error('Error marking posts as seen:', markPostsResponse);
          }
  
          console.log('Successfully followed the user.');
        } else {
          console.error('Error following user:', followResponse);
        }
      }
    } catch (error) {
      console.error('Error handling follow/unfollow:', error);
    }
  };
  

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/get-followers?ownerUserId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setModalData(data.followers);
      } else {
        console.error('Error fetching followers:', data.message);
        setModalData([]);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      setModalData([]);
    }
  };
  

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/get-following?ownerUserId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setModalData(data.following);
      } else {
        console.error('Error fetching following:', data.message);
        setModalData([]);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      setModalData([]);
    }
  };

  const fetchSubscribed = async () => {
    try {
      const response = await fetch(`/api/get-subscribed?ownerUserId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setModalData(data.subscribed);
      } else {
        console.error('Error fetching subscribed:', data.message);
        setModalData([]);
      }
    } catch (error) {
      console.error('Error fetching subscribed:', error);
      setModalData([]);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalTitle(`${type.charAt(0).toUpperCase() + type.slice(1)}`); // Capitalize the title
    setIsModalOpen(true);
  
    // Fetch data based on the type
    if (type === 'followers') {
      fetchFollowers();
    } else if (type === 'following') {
      fetchFollowing();
    } else if (type === 'subscribed') {
      fetchSubscribed();
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  

  const checkSubscription = async (tierId) => {
    try {
      const response = await fetch('/api/get-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, tierId }),
      });

      const data = await response.json();
      setSubscriptionStatus((prevStatus) => ({
        ...prevStatus,
        [tierId]: data.success, // True if subscribed, false if not
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscription = async (targetUserId) => {
    try {
      // Make sure the session is valid
      if (!session) {
        console.error('User session not found.');
        return;
      }

      // Call API to update target user's followers field
      const response = await axios.post('/api/update-followers', {
        ownerUserId: userId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        console.log('Successfully updated target user\'s followers.');

        // Call API to update current user's subscribed field
        const responseCurrentUser = await axios.post('/api/update-subscriptions', {
          targetUserId: userId,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (responseCurrentUser.data.success) {
          console.log('Successfully updated current user\'s subscriptions.');
          alert('Subscription successful!');
          // You can add more logic here, such as redirecting or updating the UI
        } else {
          console.error('Failed to update current user\'s subscriptions:', responseCurrentUser.data.message);
          alert('111Failed to subscribe.');
        }
      } else {
        console.error('Failed to update target user\'s followers:', response.data.message);
        alert('Failed to subscribe.');
      }
    } catch (error) {
      console.error('Error handling subscription:', error);
      alert('An error occurred while subscribing.');
    }
  };






  const openCloudinaryWidget = (type, tierId = null) => {
    // Cloudinary upload logic
    // Use type to differentiate between free and paid content
    // Use tierId for paid content to update the correct tier
  };

  if (status === "loading" || !userData) {
    return <div>Loading...</div>;
  }



  const renderFreeContent = () => {
    const router = useRouter();

    if (!freeContent || freeContent.length === 0) {
      return <p>No free content available.</p>;
    }
    const handlePostClick = (index) => {
      // Store the freeContent data in localStorage (or use a context)
      localStorage.setItem('posts', JSON.stringify(freeContent));

      // Get the username from userdata
      const username = userData.username;

      // Navigate to the view-posts page with both index and username as query parameters
      router.push(`/view-posts?index=${index}&username=${username}&userId=${userId}&isOwnPage=${isMyPage}`);
    };







    return (
      <div className="grid grid-cols-3 gap-4 ">
        {freeContent.map((post, index) => {
          if (activeContent === "all" || (activeContent === "images" && post.type === "image") || (activeContent === "videos" && post.type === "video")) {
            return (
              <div
                key={post._id}
                className="content-item cursor-pointer overflow-hidden border-2 border-cyan-500 rounded-md"
                onClick={() => handlePostClick(index)}  // Handle post click
                style={{ width: '100%', height: '14rem' }}  // Set dimensions
              >
                {post.type === "image" && post.contentUrl && (
                  <img
                    src={post.contentUrl}
                    alt={post.description}
                    className="w-full h-full object-cover"  // Ensure it fills the container while cropping overflow
                  />
                )}
                {post.type === "video" && post.contentUrl && (
                  <video controls className="w-full h-full object-cover">
                    <source src={post.contentUrl} type="video/mp4" />
                  </video>
                )}
              </div>

            );
          }
          return null; // Skip rendering if the post doesn't match the active content filter
        })}
      </div>
    );
  };

  
    const socialMediaIcons = {
      instagram: <FaInstagram size={30} />,
      twitter: <FaTwitter size={30}/>,
      facebook: <FaFacebook size={30}/>,
      linkedin: <FaLinkedin size={30}/>,
      // Add more social media icons as needed
    };
  

  const handleAddFreePostClick = () => {
    setAddFreePost(true);
  };

  const handleAddPaidPostClick = () => {
    setAddPaidPost(true);
  };

  const handleFreeMediaUpload = (result) => {
    setFreePostMedia(result.info.secure_url);
  };

  const handlePaidMediaUpload = (result) => {
    setPaidPostMedia(result.info.secure_url);
  };

  const determineType = (url) => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    const extension = url.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension) ? 'video' : 'image';
  };

  const handleSubmitFreePost = async () => {
    if (!freePostDescription || !freePostMedia) {
      // Handle missing description or media (optional)
      return;
    }
    const type = determineType(freePostMedia);

    // Send free post details to API
    const res = await fetch('/api/add-free-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        description: freePostDescription,
        contentUrl: freePostMedia,
        type: type,
        username: userData.username,
        // Add any other necessary fields (e.g., userID)
      }),
    });

    if (res.ok) {
      // Reset state and handle post-submission logic
      setAddFreePost(false);
      setFreePostDescription("");
      setFreePostMedia(null);
      // Fetch or update posts if needed
    } else {
      // Handle error
    }
  };

  const handleSubmitPaidPost = async () => {
    if (!paidPostDescription || !paidPostMedia) {
      // Handle missing description or media (optional)
      return;
    }
    const type = determineType(paidPostMedia);

    // Send paid post details to API
    const res = await fetch('/api/add-paid-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: paidPostDescription,
        contentUrl: paidPostMedia,
        userId: userId,
        type: type,

        // Add any other necessary fields (e.g., userID)
      }),
    });

    if (res.ok) {
      // Reset state and handle post-submission logic
      setAddPaidPost(false);
      setPaidPostDescription("");
      setPaidPostMedia(null);
      // Fetch or update posts if needed
    } else {
      // Handle error
    }
  };

  const handleUserClick = (username) => {
    router.push(`/${username}`); // Redirect to dynamic URL
  };




  return (
    
    <>
    {userData.premiumCost!=-1 ? (
      <>
    
      <div className="profileinfo flex flex-col items-center justify-center">
        <div className="cover w-full bg-green-600 relative" style={{ paddingTop: "25%" }}>
          <img
            className="absolute top-0 left-0 w-full h-full object-cover border-teal-400 border-2"
            src={userData.coverPic}
            alt=""
          />
          <div className="profile w-28 h-28 absolute -bottom-16 right-[46%]">
            <img
              className="object-cover w-full h-full border-white border-2"
              src={userData.profilePic}
              alt=""
            />
          </div>
        </div>

        <div className="info mt-16 pt-2 text-center ml-2">
          <div className="name font-bold">@{userData.username}</div>
        </div>


        {!isMyPage&&
        <div className="flex justify-center items-center">
          <button
            onClick={handleFollowClick}
            className={`px-4 py-2 rounded ${isFollowing ? 'bg-gray-400' : 'bg-blue-500 text-center flex justify-center items-center'}`}
             // Disable button if already following
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>}
      </div>

      {/* New section for bio, followers count, and social media links */}
      <div className="bio-followers-social my-4 mx-2 flex flex-col sm:flex-row gap-4">
        <div className="bio-box p-4 border border-gray-300 rounded-md w-4/6 text-center flex-col justify-center items-center">
          <h3 className="font-bold mb-2 text-xl text-cyan-300">Bio</h3>
          <p className="text-base flex justify-center items-center">{userData.bio}</p>
        </div>
        <div className="followers-social-box p-4 border border-gray-300 rounded-md w-2/6">
          <h3 className="font-bold mb-2 text-xl text-center">Followers: {userData.followers.length}</h3>
          <h1 className=" text-center text-gray-500 text-sm">Follow On</h1>
          <div className="social-media-links flex gap-3 justify-center items-center">
      {userData.socialMediaLinks.map((link, index) => {
        const IconComponent = socialMediaIcons[link.name.toLowerCase()];
        if (!IconComponent) return null; // Skip if no icon available for the given name

        return (
          <a 
            key={index}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon p-2 rounded-full "
            title={link.name}
          >
            {IconComponent}
          </a>
        );
      })}
    </div>
        </div>
      </div>

      <div>
      <div className="flex gap-4 justify-center m-2">
        <button
          onClick={() => openModal('followers')}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          View Followers
        </button>
        <button
          onClick={() => openModal('following')}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          View Following
        </button>
        <button
          onClick={() => openModal('subscribed')}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          View Subscribed
        </button>
      </div>

      {/* Modal inside the same component */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>

            <div className="overflow-y-auto max-h-80"> {/* Make the content scrollable */}
              {modalData.length > 0 ? (
                modalData.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center mb-4 cursor-pointer" // Make the div clickable
                    onClick={() => handleUserClick(user.username)} // Redirect on click
                  >
                    <img src={user.profilePic} alt={user.username} className="w-10 h-10 rounded-full mr-4" />
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      {modalType === 'followers' && user.isSubscribed && (
                        <span className="text-yellow-500 ml-2">🌟 Subscribed</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No {modalType} users to display</p>
              )}
            </div>

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
      <div className="actbtn flex  w-full">
        <button onClick={() => { setActivetab("free") }} className={` w-1/2 text-center border-r-0  border-gray-700  ${activeTab === "free" ? 'bg-gray-800' : 'bg-black'}`}>Free</button>
        <button onClick={() => { setActivetab("paid") ,fetchPaidContent(userId) }} className={` w-1/2 text-center  border-l-0 border-gray-700  ${activeTab === "paid" ? 'bg-gray-800' : 'bg-black'}`}>Premium</button>
      </div>

      {activeTab == "free" &&

        <>
          <div className="free-content-section my-4 mx-2 flex flex-col items-center gap-4">
            <h3 className="font-bold mb-2 ">Free Content</h3>
            <div>
              {isMyPage && (
                <>

                  {addFreePost ? (
                    <div className="add-post-form">
                      <input
                        type="text"
                        placeholder="Description"
                        value={freePostDescription}
                        onChange={(e) => setFreePostDescription(e.target.value)}
                        className="border p-2 mb-4 w-full text-black"
                      />
                      <CldUploadWidget
                        uploadPreset="ml_default"
                        onSuccess={handleFreeMediaUpload}
                        onError={(err) => console.error("Upload error:", err)}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={open}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                          >
                            Upload Media
                          </button>
                        )}
                      </CldUploadWidget>
                      {freePostMedia && (
                        <img
                          src={freePostMedia}
                          alt="Uploaded Media"
                          className="mt-2 w-32 h-32 object-cover rounded" // Adjust the size and styling as needed
                        />
                      )}
                      <button
                        onClick={handleSubmitFreePost}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Submit Free Post
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddFreePostClick}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Add Free Post
                    </button>
                  )}

                  {/* Add Paid Post Section */}




                </>
              )}
            </div>
            <div className="free-content-options flex gap-4 ">
              {["all", "images", "videos"].map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    setActiveContent(type);
                  }}
                  className={`cursor-pointer ${activeContent === type ? "font-bold border-b-2 border-white" : " text-gray-300"}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              ))}
            </div>
            <div className="free-content mt-4">{renderFreeContent()}</div>
          </div>
        </>
      }



      {/* Content Category Filter */}
      {activeTab != "free" &&
        <div className="free-content-section my-4 mx-2  flex flex-col items-center gap-4">
          <h3 className="font-bold mb-2" >Paid Content</h3>
          <div>
            {isMyPage && (
              <>



                {/* Add Paid Post Section */}
                {addPaidPost ? (
                  <div className="add-post-form">
                    <input
                      type="text"
                      placeholder="Description"
                      value={paidPostDescription}
                      onChange={(e) => setPaidPostDescription(e.target.value)}
                      className="border p-2 mb-4 w-full text-black"
                    />
                    <CldUploadWidget
                      uploadPreset="ml_default"
                      onSuccess={handlePaidMediaUpload}
                      onError={(err) => console.error("Upload error:", err)}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={open}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                        >
                          Upload Media
                        </button>
                      )}
                    </CldUploadWidget>
                    {paidPostMedia && (
                      <img
                        src={paidPostMedia}
                        alt="Uploaded Media"
                        className="mt-2 w-32 h-32 object-cover rounded" // Adjust the size and styling as needed
                      />
                    )}
                    <button
                      onClick={handleSubmitPaidPost}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Submit Paid Post
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddPaidPostClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Paid Post
                  </button>
                )}



              </>
            )}
          </div>
          <div className="free-content-options flex gap-4">
            {["all", "images", "videos"].map((type) => (
              <div
                key={type}
                onClick={() => {
                  setActiveContentPaid(type);
                }}
                className={`cursor-pointer ${activeContentPaid === type ? "font-bold border-b-2 border-white" : "text-gray-300"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
          <div className="paid-content mt-4">{renderPaidContent()}</div>
        </div>
      }
      </>):( <>
      <div className=" text-2xl font-bold flex justify-center items-center w-full min-h-screen ">
        <h3>User hasnt completed setting up his Page!</h3>
      </div>
        </>)}
    </>
  );
};

export default Username;