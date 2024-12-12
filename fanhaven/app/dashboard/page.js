"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import "tailwindcss/tailwind.css";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone: "",
    domain: "",
    profilePic: "",
    coverPic: "",
    bio: "",
    premiumCost: "",  // Added premiumCost field
    socialMediaLinks: [{ name: "", link: "" }],
    razorpayId: "",
    razorpaySecret: "",
  });

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [editing, setEditing] = useState({});
  const [usern, setusername] = useState("")

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");

    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/get-user?email=${session.user.email}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            ...data,
            socialMediaLinks: data.socialMediaLinks || [{ name: "", link: "" }],
          });
          setusername(data.username)

          
          
        } else {
          console.error("Error fetching user data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [session, status, router]);


  const handleUploadError = (error) => {
    console.error("Cloudinary upload error:", error);
  };
  const handleProfilePicUpload = (result) => {
    if (result.event === 'success') {
      setFormData((prevState) => ({
        ...prevState,
        profilePic: result.info.secure_url,
      }));
    }
  };

  const handleCoverPicUpload = (result) => {
    if (result.event === 'success') {
      setFormData((prevState) => ({
        ...prevState,
        coverPic: result.info.secure_url,
      }));
    }
  };



  const checkUsernameAvailability = async (username) => {
    console.log(username,usern)
    if(username===usern){
      setUsernameAvailable(true)
    }
    else{
    try {
      const response = await fetch(
        `/api/check-username?username=${username}&currentUsername=${usern}`
      );
      const isAvailable = await response.json();
      setUsernameAvailable(isAvailable.available); // Assuming the API returns an "available" boolean
    } catch (error) {
      console.error("Error checking username availability:", error);
      setUsernameAvailable(null);
    }}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value || "",
    }));

    // Check username availability when the username input changes
    if (name === "username") {
      checkUsernameAvailability(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/user-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Profile updated successfully");
      } else {
        const errorData = await res.json();
        console.error("Error updating profile:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };



  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {session && (
        <div className="mb-4 text-xl">WELCOME {session.user.email}</div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Personal Info Section */}
        <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username:
          </label>
          <div className="flex items-center">
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              readOnly={!editing.username}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editing.username ? "" : "bg-gray-100"
                }`}
            />
            <button
              type="button"
              onClick={() => setEditing({ ...editing, username: !editing.username })}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editing.username ? "Done" : "Edit"}
            </button>
          </div>
          {/* Display Username Availability Status */}
          {formData.username && (
            <p
              className={`text-sm mt-1 ${usernameAvailable === null
                  ? "text-gray-500"
                  : usernameAvailable
                    ? "text-green-500"
                    : "text-red-500"
                }`}
            >
              {usernameAvailable === null
                ?""
                : usernameAvailable
                  ? "Username is available"
                  : "Username is already taken"}
            </p>
          )}
        </div>

        {/* Other form fields */}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Domain of Content:
          </label>
          <div className="flex items-center">
            <input
              type="text"
              name="domain"
              value={formData.domain || ""}
              onChange={handleChange}
              readOnly={!editing.domain}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editing.domain ? "" : "bg-gray-100"
                }`}
            />
            <button
              type="button"
              onClick={() =>
                setEditing({ ...editing, domain: !editing.domain })
              }
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editing.domain ? "Done" : "Edit"}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bio:
          </label>
          <div className="flex items-center">
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              readOnly={!editing.bio}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editing.bio ? "" : "bg-gray-100"
                }`}
            />
            <button
              type="button"
              onClick={() =>
                setEditing({ ...editing, bio: !editing.bio })
              }
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editing.bio ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profile Picture:
          </label>
          <CldUploadWidget
            uploadPreset="ml_default"
            onSuccess={handleProfilePicUpload}
            onError={(err) => console.error("Upload error:", err)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Upload Profile Picture
              </button>
            )}
          </CldUploadWidget>
          {formData.profilePic && (
            <img
              src={formData.profilePic}
              alt="Profile Picture"
              className="mt-2 w-32 h-32 object-cover rounded" // Change these classes to match your user page dimensions
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Cover Picture:
          </label>
          <CldUploadWidget
            uploadPreset="ml_default"
            onSuccess={handleCoverPicUpload}
            onError={(err) => console.error("Upload error:", err)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Upload Cover Picture
              </button>
            )}
          </CldUploadWidget>
          {formData.coverPic && (
            <img
              src={formData.coverPic}
              alt="Cover Picture Preview"
              className="mt-2 object-cover w-[300px] h-[132px]" // New smaller dimensions maintaining aspect ratio
            />
          )}

        </div>

        {/* Professional Info Section */}
        <h2 className="text-xl font-semibold mb-4">Professional Info</h2>
        {/* Premium Cost Section */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Premium Cost:
          </label>
          <input
            type="number"
            name="premiumCost"
            value={formData.premiumCost}
            onChange={(e) => setFormData({ ...formData, premiumCost: e.target.value })}
            placeholder="Enter premium content cost"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Social Media Links Section */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Social Media Links:
          </label>
          {formData.socialMediaLinks.map((link, index) => (
            <div key={index} className="mb-2">
              <select
                name={`social-media-name-${index}`}
                value={link.name}
                onChange={(e) => {
                  const updatedLinks = [...formData.socialMediaLinks];
                  updatedLinks[index].name = e.target.value;
                  setFormData((prevState) => ({
                    ...prevState,
                    socialMediaLinks: updatedLinks,
                  }));
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              >
                <option value="">Select Platform</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
              <input
                type="url"
                name={`social-media-link-${index}`}
                value={link.link}
                onChange={(e) => {
                  const updatedLinks = [...formData.socialMediaLinks];
                  updatedLinks[index].link = e.target.value;
                  setFormData((prevState) => ({
                    ...prevState,
                    socialMediaLinks: updatedLinks,
                  }));
                }}
                placeholder="Link"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedLinks = formData.socialMediaLinks.filter(
                    (_, linkIndex) => linkIndex !== index
                  );
                  setFormData((prevState) => ({
                    ...prevState,
                    socialMediaLinks: updatedLinks,
                  }));
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove Link
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData((prevState) => ({
                ...prevState,
                socialMediaLinks: [...prevState.socialMediaLinks, { name: "", link: "" }],
              }))
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Social Media Link
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Razorpay ID:
          </label>
          <input
            type="text"
            name="razorpayId"
            value={formData.razorpayId || ""}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Razorpay Secret:
          </label>
          <input
            type="text"
            name="razorpaySecret"
            value={formData.razorpaySecret || ""}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Dashboard;
