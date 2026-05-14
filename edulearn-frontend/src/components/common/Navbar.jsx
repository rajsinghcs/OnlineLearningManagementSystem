import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  AcademicCapIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'INSTRUCTOR': return '/instructor/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <AcademicCapIcon className="h-10 w-10 text-[#3b82f6] group-hover:scale-110 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-[#3b82f6] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Edu<span className="text-[#3b82f6]">Learn</span></span>
            </Link>
            <div className="hidden md:ml-12 md:flex md:items-center md:space-x-8">
              <Link to="/courses" className="text-gray-400 hover:text-[#3b82f6] px-3 py-2 text-[10px] font-black tracking-[0.3em] uppercase transition-all">Browse</Link>
              {isAuthenticated && role === 'STUDENT' && (
                <Link to="/student/my-courses" className="text-gray-400 hover:text-[#3b82f6] px-3 py-2 text-[10px] font-black tracking-[0.3em] uppercase transition-all">Learning</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white px-3 py-2 text-[10px] font-black tracking-[0.3em] uppercase">Login</Link>
                <Link to="/register" className="btn-cyber py-3 px-10">Initiate Access</Link>
              </>
            ) : (
              <div className="flex items-center space-x-8">
                <NotificationBell />
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-4 focus:outline-none group"
                  >
                    <div className="h-12 w-12 rounded-2xl border border-white/10 p-0.5 group-hover:border-[#3b82f6] transition-all overflow-hidden shadow-lg">
                      <img 
                        src={user?.profilePicUrl || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="h-full w-full object-cover rounded-xl"
                      />
                    </div>
                    <span className="text-xs font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em]">{user?.fullName?.split(' ')[0]}</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div 
                      className="absolute right-0 w-64 mt-6 py-4 glass-card rounded-3xl animate-in fade-in zoom-in-95 p-2"
                    >
                      <Link to={getDashboardLink()} onClick={() => setIsProfileOpen(false)} className="block px-6 py-3 text-[10px] font-black text-gray-400 hover:text-[#3b82f6] hover:bg-white/5 transition-colors uppercase tracking-[0.2em]">Dashboard</Link>
                      <Link to={role === 'STUDENT' ? '/student/profile' : `/${role?.toLowerCase() || 'student'}/profile`} onClick={() => setIsProfileOpen(false)} className="block px-6 py-3 text-[10px] font-black text-gray-400 hover:text-[#3b82f6] hover:bg-white/5 transition-colors uppercase tracking-[0.2em]">Profile</Link>
                      <div className="my-2 border-t border-white/5" />
                      <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="block w-full text-left px-6 py-3 text-[10px] font-black text-red-500 hover:bg-red-500/10 uppercase tracking-[0.2em]">Disconnect</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#3b82f6]">
              {isMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/5 p-6 space-y-4 mt-2 mx-4 rounded-[2rem]">
          <Link to="/courses" className="block px-4 py-4 text-[10px] font-black text-gray-400 hover:text-[#3b82f6] uppercase tracking-[0.2em]">Browse</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="block px-4 py-4 text-[10px] font-black text-gray-400 hover:text-[#3b82f6] uppercase tracking-[0.2em]">Login</Link>
              <Link to="/register" className="block px-4 py-4 text-[10px] font-black text-white bg-[#3b82f6] rounded-2xl uppercase tracking-[0.2em] text-center">Join Now</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className="block px-4 py-4 text-[10px] font-black text-gray-400 hover:text-[#3b82f6] uppercase tracking-[0.2em]">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-4 text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
