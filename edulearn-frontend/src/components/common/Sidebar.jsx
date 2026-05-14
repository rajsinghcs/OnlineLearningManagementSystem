import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BookOpenIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  TicketIcon,
  AcademicCapIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ type }) => {
  const location = useLocation();
  
  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: HomeIcon },
    { name: 'My Learning', path: '/student/my-courses', icon: AcademicCapIcon },
    { name: 'Subscriptions', path: '/student/subscriptions', icon: TicketIcon },
    { name: 'Notifications', path: '/student/notifications', icon: TrophyIcon },
    { name: 'My Profile', path: '/student/profile', icon: Cog6ToothIcon },
  ];

  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: HomeIcon },
    { name: 'My Courses', path: '/instructor/courses', icon: BookOpenIcon },
    { name: 'Create Course', path: '/instructor/courses/new', icon: PlusCircleIcon },
    { name: 'Profile', path: '/instructor/profile', icon: Cog6ToothIcon },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Manage Users', path: '/admin/users', icon: UserGroupIcon },
    { name: 'Course Review', path: '/admin/courses', icon: AcademicCapIcon },
    { name: 'Payments', path: '/admin/payments', icon: CreditCardIcon },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: TicketIcon },
    { name: 'Certificates', path: '/admin/certificates', icon: BookOpenIcon },
    { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Notifications', path: '/admin/notifications', icon: BellAlertIcon },
    { name: 'Discussions', path: '/admin/discussions', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', path: '/admin/profile', icon: Cog6ToothIcon },
  ];

  let links = studentLinks;
  if (type === 'ADMIN') links = adminLinks;
  else if (type === 'INSTRUCTOR') links = instructorLinks;

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-dark-bg/50 backdrop-blur-xl border-r border-white/5 h-[calc(100vh-96px)] sticky top-24 z-20">
      <div className="flex flex-col flex-grow pt-10 pb-4 overflow-y-auto px-6">
        <nav className="flex-1 space-y-4">
          <div className="px-6 mb-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic">System Navigation</span>
          </div>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`group flex items-center px-6 py-4 text-[10px] font-black rounded-2xl transition-all duration-500 tracking-[0.2em] uppercase italic ${
                  isActive 
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6] shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] border border-[#3b82f6]/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <link.icon className={`mr-5 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#3b82f6]' : 'text-gray-600 group-hover:text-gray-400'
                }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto px-6 py-8">
          <div className="glass-card p-6 bg-[#3b82f6]/5 border-[#3b82f6]/10 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <SparklesIcon className="h-4 w-4 text-[#3b82f6]" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Network Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
