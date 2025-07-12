import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { userAPI } from '../services/userAPI';

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + suggestions.length - 1) % suggestions.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % suggestions.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const selectItem = (index) => {
    const item = suggestions[index];
    if (item) {
      props.command({ id: item._id, label: item.username });
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!props.query || props.query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await userAPI.searchUsers(props.query);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Error fetching user suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [props.query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs">
        <div className="text-sm text-gray-500">No users found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs max-h-40 overflow-y-auto">
      {suggestions.map((item, index) => (
        <div
          key={item._id}
          className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
            index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          onClick={() => selectItem(index)}
        >
          @{item.username}
        </div>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
