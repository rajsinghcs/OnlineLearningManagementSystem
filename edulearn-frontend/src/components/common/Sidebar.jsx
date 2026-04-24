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
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ type }) => {
  const location = useLocation();
  
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
  ];

  const links = type === 'ADMIN' ? adminLinks : instructorLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-4 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
