import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const TagInput = ({ tags = [], onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions] = useState([
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'TypeScript', 'Vue.js', 'Angular', 'Express', 'MongoDB', 'PostgreSQL',
    'GraphQL', 'REST API', 'Docker', 'AWS', 'Git', 'Algorithm', 'Data Structure'
  ]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, tags, suggestions]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag = inputValue.trim()) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      onChange([...tags, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="min-h-[42px] p-2 border border-gray-300 rounded-lg flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 outline-none text-sm min-w-[120px]"
            disabled={tags.length >= 5}
          />
          
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addTag()}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {tags.length >= 5 && (
        <p className="text-xs text-gray-500 mt-1">
          Maximum 5 tags allowed
        </p>
      )}
    </div>
  );
};

export default TagInput;
