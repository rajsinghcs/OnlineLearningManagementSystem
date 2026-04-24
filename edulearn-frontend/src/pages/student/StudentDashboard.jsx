import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../../api/enrollmentApi';
import { discnotifApi } from '../../api/discnotifApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpenIcon, TrophyIcon, FireIcon, BellIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, notifRes] = await Promise.all([
          enrollmentApi.getByStudent(user.userId),
          discnotifApi.getNotifications(user.userId)
        ]);
        setEnrollments(enrollRes.data);
        setNotifications(notifRes.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard data fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.userId]);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { label: 'Active Courses', value: enrollments.filter(e => e.status === 'ACTIVE').length, icon: BookOpenIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'Completed', value: enrollments.filter(e => e.status === 'COMPLETED').length, icon: TrophyIcon, color: 'bg-green-50 text-green-600' },
    { label: 'Certificates', value: enrollments.filter(e => e.status === 'COMPLETED').length, icon: TrophyIcon, color: 'bg-amber-50 text-amber-600' },
    { label: 'Daily Streak', value: '12 Days', icon: FireIcon, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-primary-200">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {user.fullName}! 👋</h1>
          <p className="text-primary-100 font-medium">You've completed 75% of your weekly learning goal. Keep it up!</p>
        </div>
        <Link to="/courses" className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center text-sm">
          Browse More Courses <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
            <Link to="/student/my-courses" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {enrollments.filter(e => e.status === 'ACTIVE').slice(0, 3).map((enroll) => (
              <div key={enroll.enrollmentId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 hover:shadow-md transition-shadow">
                <img 
                  src={enroll.courseThumbnail || 'https://via.placeholder.com/300x200'} 
                  className="h-20 w-28 rounded-xl object-cover" 
                  alt={enroll.courseTitle} 
                />
                <div className="flex-grow space-y-2">
                  <h3 className="font-bold text-gray-900 leading-tight">{enroll.courseTitle}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Progress: {enroll.progress || 0}%</span>
                    <span className="text-primary-600 font-bold uppercase tracking-widest">Active</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-500" 
                      style={{ width: `${enroll.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                <Link to={`/student/learn/${enroll.courseId}/${enroll.lastLessonId || 0}`} className="btn-primary p-3 rounded-xl shadow-lg shadow-primary-200">
                  <PlayCircleIcon className="h-6 w-6" />
                </Link>
              </div>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">You haven't enrolled in any courses yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
            <Link to="/student/notifications" className="text-sm font-bold text-primary-600 hover:underline">See All</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors">
                <div className="bg-primary-50 p-2 rounded-lg">
                  <BellIcon className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">2 hours ago</span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm italic">No new notifications.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon helper
const PlayCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default StudentDashboard;
