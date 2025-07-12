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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            StackIt
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/ask"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Ask Question</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <NotificationDropdown />

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User size={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
