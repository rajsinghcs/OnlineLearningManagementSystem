import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout, getRole } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === 'STUDENT') return '/student/dashboard';
    if (role === 'INSTRUCTOR') return '/instructor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">EduLearn</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link to="/courses" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Browse Courses</Link>
              {isAuthenticated && role === 'STUDENT' && (
                <Link to="/student/my-courses" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">My Learning</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">Join for Free</Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <img 
                      src={user?.profilePicUrl || 'https://via.placeholder.com/150'} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full border border-gray-200"
                    />
                    <span className="text-sm font-medium text-gray-700">{user?.fullName?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                    <Link to={getDashboardLink()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                    <Link to="/student/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile Settings</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-900">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 pb-4 px-4 space-y-2">
          <Link to="/courses" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Browse Courses</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Login</Link>
              <Link to="/register" className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-lg">Register</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
