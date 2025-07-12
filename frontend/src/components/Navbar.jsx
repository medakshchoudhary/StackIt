import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            StackIt
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/ask"
                  className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Ask Question</span>
                  <span className="sm:hidden">Ask</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base hidden md:block"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <NotificationDropdown />

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      {user?.username}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Logout"
                  >
                    <LogOut size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
