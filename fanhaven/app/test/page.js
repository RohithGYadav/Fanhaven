'use client';  // This will mark the component as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';  // Correct import for App Router

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();  // Correct `useRouter` from App Router

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (term.length >= 3) {
      setLoading(true);
      try {
        const response = await fetch(`/api/search-users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: term }),
        });

        const data = await response.json();
        setSuggestions(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    } else {
      setSuggestions([]);  // Clear suggestions when search term is too short
    }
  };

  const handleSelectUser = (username) => {
    router.push(`/user/${username}`);  // Navigate to dynamic user page
  };

  return (
    <div className="search-user">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search users..."
        className="border border-gray-300 rounded p-2 w-full"
      />
      {loading && <p>Loading...</p>}
      <ul className="suggestions-list">
        {suggestions.map((user) => (
          <li
            key={user._id}
            className="cursor-pointer p-2 hover:bg-gray-100"
            onClick={() => handleSelectUser(user.username)}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUser;
