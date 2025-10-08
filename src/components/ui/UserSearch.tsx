import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { searchUsers, User as UserType } from '../../api/users';

interface UserSearchProps {
  value: string;
  onChange: (user: UserType | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserSearch({ value, onChange, placeholder = "Search users...", disabled = false }: UserSearchProps) {
  const [query, setQuery] = useState(value);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false); // Track if user is actually typing
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when value prop changes (without triggering search)
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
      setIsUserTyping(false); // Don't trigger search for programmatic updates
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users when query changes (only if user is typing)
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim() && query.length >= 3 && isUserTyping) {
        setLoading(true);
        try {
          const results = await searchUsers(query);
          console.log('UserSearch: Got results:', results);
          setUsers(results);
          setShowDropdown(results.length > 0);
        } catch (error) {
          console.error('Error searching users:', error);
          setUsers([]);
          setShowDropdown(false);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
        setShowDropdown(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query, isUserTyping]);

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    setQuery(user.name);
    setShowDropdown(false);
    setIsUserTyping(false); // Reset typing flag when user selects
    onChange(user);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsUserTyping(true); // Mark that user is typing
    
    if (!newQuery.trim()) {
      setSelectedUser(null);
      onChange(null);
      setIsUserTyping(false);
    }
  };

  const handleInputFocus = () => {
    if (users.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className={`flex items-center border-b ${disabled ? 'bg-gray-50' : 'bg-white'}`}>
        <input
          ref={inputRef}
          type="text"
          className={`w-full py-1 text-sm outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-transparent'}`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          readOnly={disabled}
        />
        <div className="flex items-center gap-1">
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
          )}
          <button 
            className={`p-1 rounded ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
            disabled={disabled}
            onClick={() => inputRef.current?.focus()}
          >
            <Search size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Dropdown with search results */}
      {showDropdown && users.length > 0 && !disabled && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => handleUserSelect(user)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                  {user.department && (
                    <div className="text-xs text-gray-400 truncate">
                      {user.department} {user.title && `• ${user.title}`}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && users.length === 0 && query.length >= 3 && !loading && isUserTyping && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm text-gray-500 text-center">
            No users found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}