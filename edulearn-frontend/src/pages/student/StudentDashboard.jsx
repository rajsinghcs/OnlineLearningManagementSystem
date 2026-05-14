import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../../api/enrollmentApi';
import { discnotifApi } from '../../api/discnotifApi';
import { courseApi } from '../../api/courseApi';
import { paymentApi } from '../../api/paymentApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  BookOpenIcon, 
  TrophyIcon, 
  BellIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  ArrowPathIcon,
  CheckBadgeIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { progressApi } from '../../api/progressApi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);

  const fetchData = async (showLoading = true) => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [enrollRes, notifRes, subRes, progressRes] = await Promise.all([
        enrollmentApi.getByStudent(user.userId).catch(() => ({ data: [] })),
        discnotifApi.getNotifications(user.userId).catch(() => ({ data: [] })),
        paymentApi.getSubscriptionByStudent(user.userId).catch(() => ({ data: null })),
        progressApi.getAllProgress(user.userId).catch(() => ({ data: [] }))
      ]);
      
      setSubscription(subRes.data);
      const completedCount = progressRes.data?.filter(p => p.isCompleted || p.completed).length || 0;
      setCompletedLessonsCount(completedCount);
      
      const rawEnrollments = enrollRes.data || [];
      const enrollmentsWithDetails = await Promise.all(
        rawEnrollments.map(async (enroll) => {
          try {
            const courseRes = await courseApi.getCourseById(enroll.courseId);
            return {
              ...enroll,
              courseTitle: courseRes.data.title,
              courseThumbnail: courseRes.data.thumbnailUrl
            };
          } catch (err) {
            return enroll;
          }
        })
      );
      
      setEnrollments(enrollmentsWithDetails);
      setNotifications(notifRes.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard data fetch failed', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.userId]);

  const handleManualRefresh = () => {
    fetchData(false);
  };

  if (loading) return <LoadingSpinner />;

  if (!user || !user.userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-10 text-center max-w-md">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Identity Error</h2>
          <p className="text-gray-400 mb-8 font-medium italic">Unable to resolve your user node. Please try re-authenticating.</p>
          <Link to="/login" className="btn-cyber py-4 px-8 block w-full">Return to Login</Link>
        </div>
      </div>
    );
  }

  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    { label: 'Modules Active', value: enrollments.length, icon: BookOpenIcon, color: 'text-[#3b82f6]' },
    { label: 'Avg Mastery', value: `${averageProgress}%`, icon: ArrowPathIcon, color: 'text-indigo-400' },
    { label: 'Nodes Unlocked', value: completedLessonsCount, icon: CheckBadgeIcon, color: 'text-[#3b82f6]' },
    { label: 'Access Tier', value: subscription ? 'PREMIUM' : 'BASIC', icon: AcademicCapIcon, color: 'text-[#3b82f6]' },
  ];

  return (
    <div className="space-y-12 bg-dark-bg text-white min-h-screen pb-20">
      {/* Dashboard Header */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[150px] group-hover:bg-[#3b82f6]/20 transition-all duration-700"></div>
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
              Terminal <span className="text-[#3b82f6]">_</span>
            </h1>
            {subscription?.status?.toUpperCase() === 'ACTIVE' && (
              <span className="bg-[#3b82f6]/10 text-[#3b82f6] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-[#3b82f6]/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                Elite Member
              </span>
            )}
          </div>
          <p className="text-gray-400 font-medium text-lg italic tracking-tight">
            Welcome back, <span className="text-white font-black">{user.fullName}</span>. System is optimized for learning.
          </p>
        </div>
        <div className="flex items-center space-x-6 relative z-10">
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`p-5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#3b82f6] hover:border-[#3b82f6]/30 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <ArrowPathIcon className="h-6 w-6" />
          </button>
          <Link to="/courses" className="btn-cyber py-5 px-12">
            Add New Module <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl group-hover:bg-[#3b82f6]/10 transition-all"></div>
            <div className={`p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 transition-transform inline-block`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-1 tracking-tighter italic">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Active <span className="text-[#3b82f6]">Streams</span></h2>
            <Link to="/student/my-courses" className="text-[10px] font-black text-[#3b82f6] hover:underline tracking-widest uppercase italic">All Modules</Link>
          </div>
          
          <div className="space-y-6">
            {enrollments.slice(0, 3).map((enroll) => (
              <div key={enroll.enrollmentId} className="glass-card flex items-center space-x-8 hover:bg-[#3b82f6]/5 group p-6 rounded-[2rem]">
                <div className="relative">
                  <img 
                    src={enroll.courseThumbnail || 'https://via.placeholder.com/300x200'} 
                    className="h-24 w-40 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    alt={enroll.courseTitle} 
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                </div>
                <div className="flex-grow space-y-3">
                  <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-[#3b82f6] transition-colors">{enroll.courseTitle}</h3>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-gray-500">Sync: {enroll.progressPercent || 0}%</span>
                    <span className={`${enroll.status?.toUpperCase() === 'COMPLETED' ? 'text-green-400' : 'text-[#3b82f6]'}`}>
                      {enroll.status?.toUpperCase() === 'COMPLETED' ? 'Synchronized' : 'Active'}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" 
                      style={{ width: `${enroll.progressPercent || 0}%` }}
                    ></div>
                  </div>
                </div>
                <Link to={`/student/learn/${enroll.courseId}/${enroll.lastLessonId || 0}`} className="p-5 bg-[#3b82f6] text-white rounded-[1.5rem] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all transform hover:scale-110">
                  <PlayCircleIcon className="h-8 w-8" />
                </Link>
              </div>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-20 glass-card border-dashed">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No active data streams found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">System <span className="text-[#3b82f6]">Feed</span></h2>
            <Link to="/student/notifications" className="text-[10px] font-black text-[#3b82f6] hover:underline tracking-widest uppercase italic">All</Link>
          </div>
          <div className="glass-card divide-y divide-white/5 p-0 overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} className="p-6 flex items-start space-x-4 hover:bg-white/5 transition-all group">
                <div className="bg-[#3b82f6]/10 p-3 rounded-xl group-hover:bg-[#3b82f6]/20 transition-colors">
                  <BellIcon className="h-6 w-6 text-[#3b82f6]" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-300 leading-relaxed font-medium group-hover:text-white transition-colors">{n.message}</p>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-3 block tracking-widest">DATA_PACKET_RECEIVED</span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-16 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Network Quiet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
