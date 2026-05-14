import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { discnotifApi } from '../../api/discnotifApi';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userId) {
      const fetchUnread = async () => {
        try {
          const res = await discnotifApi.getUnreadCount(user.userId);
          setUnreadCount(res.data);
        } catch (err) {
          console.error('Failed to fetch notifications count', err);
        }
      };

      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.userId, setUnreadCount]);

  const handleClick = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/notifications');
    } else if (user?.role === 'STUDENT') {
      navigate('/student/notifications');
    }
  };

  return (
    <div onClick={handleClick} className="relative cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#3b82f6]/50 hover:bg-white/10 transition-all group">
      <BellIcon className="h-6 w-6 text-gray-400 group-hover:text-[#3b82f6] transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-[8px] font-black leading-none text-white transform bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
