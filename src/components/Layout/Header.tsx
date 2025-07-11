import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-semibold">OWC Portal</span>
        </Link>

        {session ? (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-sm">
              Welcome, {profile?.full_name || 'User'}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-sm px-2 py-1 rounded hover:bg-primary-dark transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="text-sm px-3 py-1.5 bg-white text-primary rounded hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;