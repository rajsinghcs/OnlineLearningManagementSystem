import React, { useEffect, useState } from 'react';
import { discnotifApi } from '../../api/discnotifApi';
import { authApi } from '../../api/authApi';
import { paymentApi } from '../../api/paymentApi';
import { courseApi } from '../../api/courseApi';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BellIcon, CheckBadgeIcon, TrashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const { user, getRole } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // For Admins sending bulk notifications
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [sending, setSending] = useState(false);

  const isAdmin = getRole() === 'ADMIN';

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      if (isAdmin) {
        const [usersRes, paymentsRes, coursesRes] = await Promise.all([
          authApi.getAllUsers(),
          paymentApi.getAllPayments(),
          courseApi.getAllCoursesAdmin()
        ]);

        const users = usersRes.data || [];
        const payments = paymentsRes.data || [];
        const courses = coursesRes.data || [];

        const userNotifs = users
          .filter(u => u.userId !== user.userId)
          .map(u => ({
            id: `user_${u.userId}`,
            title: '👤 New User Registered',
            message: `User ${u.fullName} (${u.role}) joined the platform.`,
            createdAt: u.createdAt || new Date().toISOString(),
            type: 'USER',
            read: false
          }));

        const enrollNotifs = payments
          .map(p => {
            const student = users.find(u => u.userId === p.studentId);
            const course = courses.find(c => c.courseId === p.courseId);
            return {
              id: `payment_${p.paymentId}`,
              title: '🎓 New Enrollment',
              message: `${student ? student.fullName : `Student #${p.studentId}`} enrolled in "${course ? course.title : `Course #${p.courseId}`}" for ₹${p.amount}.`,
              createdAt: p.paidAt || new Date().toISOString(),
              type: 'ENROLLMENT',
              read: false
            };
          });

        const simNotifs = [
          {
            id: 'sim_c1',
            title: '💬 New Forum Comment',
            message: 'Akash commented on "Java Spring Boot Fundamentals": "What is the best IDE to use for testing?"',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            type: 'COMMENT',
            read: false
          },
          {
            id: 'sim_r1',
            title: '⭐ New Course Rating',
            message: 'Student Raj evaluated "React and Tailwind Mastery" with a perfect 5/5 rating.',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            type: 'RATING',
            read: false
          }
        ];

        const combined = [...userNotifs, ...enrollNotifs, ...simNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(combined);
        setUnreadCount(combined.filter(n => !n.read).length);
      } else {
        const res = await discnotifApi.getNotifications(user.userId);
        // Map backend fields to frontend expectations
        const mappedNotifs = res.data.map(n => ({
          ...n,
          id: n.notificationId,
          read: n.isRead
        }));
        setNotifications(mappedNotifs);
        await discnotifApi.markAllRead(user.userId);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.userId]);

  const handleMarkRead = async (id) => {
    try {
      if (!id.toString().startsWith('sim_') && !id.toString().startsWith('user_') && !id.toString().startsWith('payment_')) {
        await discnotifApi.markAsRead(id);
      }
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!id.toString().startsWith('sim_') && !id.toString().startsWith('user_') && !id.toString().startsWith('payment_')) {
        await discnotifApi.deleteNotification(id);
      }
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleSendBulk = async (e) => {
    e.preventDefault();
    if (!bulkTitle || !bulkMessage) {
      toast.error('Please fill all fields');
      return;
    }
    setSending(true);
    try {
      // 1. Fetch all registered users
      const usersRes = await authApi.getAllUsers();
      const allUserIds = (usersRes.data || []).map(u => u.userId);
      
      if (allUserIds.length === 0) {
        toast.error('No users found to broadcast to');
        return;
      }

      // 2. Send broadcast to all user IDs
      await discnotifApi.sendBulkNotification({
        userIds: allUserIds,
        title: bulkTitle,
        message: bulkMessage,
        type: 'ANNOUNCEMENT'
      });

      toast.success(`Broadcasting to ${allUserIds.length} users...`);
      setBulkTitle('');
      setBulkMessage('');
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
      const errorDetail = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message || 'Check server logs';
      toast.error(`Broadcast failed: ${errorDetail}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
          <BellIcon className="h-8 w-8 text-primary-600" />
          <span>Notifications</span>
        </h1>
        <p className="text-gray-500 font-medium mt-2">Stay updated with platform alerts and announcements.</p>
      </div>

      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <MegaphoneIcon className="h-5 w-5 text-primary-600" />
            <span>Broadcast Platform Announcement</span>
          </h2>
          <form onSubmit={handleSendBulk} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
              <input
                type="text"
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                className="w-full border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm font-medium py-3"
                placeholder="New feature released! 🚀"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Message</label>
              <textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                className="w-full border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm font-medium py-3"
                rows="3"
                placeholder="Write your notification message here..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary px-6 py-3 text-sm font-bold rounded-xl"
            >
              {sending ? 'Sending...' : 'Broadcast Notification'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-6 flex items-start justify-between hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''
                }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${n.type === 'ANNOUNCEMENT' ? 'bg-amber-50 text-amber-600' :
                    n.type === 'ENROLLMENT' ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'
                  }`}>
                  <BellIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <span>{n.title || 'Notification'}</span>
                    {!n.read && <span className="w-2 h-2 bg-primary-600 rounded-full block"></span>}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium mt-1">{n.message}</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    title="Mark as Read"
                  >
                    <CheckBadgeIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm italic">
              No notifications available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
