import React, { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../config/authConfig';
import './Layout.css';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const user = getUser();
  const userName = user?.name || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <Menu className="menu-icon" size={24} />
      </div>
      <div className="header-right">
        <div className="profile-container" ref={profileRef}>
          <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="user-avatar">
              <img src={`https://i.pravatar.cc/150?u=${userName}`} alt={userName} />
            </div>
            <span>{userName}</span>
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-item">View Profile</div>
              <div className="profile-dropdown-item logout" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
