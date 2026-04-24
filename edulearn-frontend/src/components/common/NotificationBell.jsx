import React, { useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { discnotifApi } from '../../api/discnotifApi';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();

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

  return (
    <div className="relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors">
      <BellIcon className="h-6 w-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
