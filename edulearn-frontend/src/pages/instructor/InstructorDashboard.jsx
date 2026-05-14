import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import { paymentApi } from '../../api/paymentApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  PlusIcon, 
  UsersIcon, 
  CurrencyRupeeIcon, 
  BookOpenIcon, 
  EllipsisVerticalIcon,
  ChartBarSquareIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatUtils';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      // Logic from original dashboard
      if (user && (user.isVerified === false || user.isApproved === false)) {
        setLoading(false);
        return;
      }

      try {
        const res = await courseApi.getCoursesByInstructor(user.userId);
        
        let totalStudents = 0;
        let totalRevenue = 0;
        const enrichedCourses = [];

        for (const c of res.data) {
          try {
            const countRes = await enrollmentApi.getEnrollmentCount(c.courseId);
            const courseStudents = countRes.data || 0;
            totalStudents += courseStudents;

            const paymentsRes = await paymentApi.getPaymentsByCourse(c.courseId).catch(() => ({ data: [] }));
            const courseRev = (paymentsRes.data || [])
              .filter(p => p.status === 'SUCCESS')
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            totalRevenue += courseRev;

            enrichedCourses.push({
              ...c,
              status: c.published ? 'PUBLISHED' : (c.approved ? 'APPROVED' : 'PENDING'),
              studentCount: courseStudents
            });
          } catch (err) {
            enrichedCourses.push({
              ...c,
              status: c.published ? 'PUBLISHED' : (c.approved ? 'APPROVED' : 'PENDING'),
              studentCount: 0
            });
          }
        }

        setCourses(enrichedCourses);
        setStats({ totalStudents, totalRevenue });
      } catch (err) {
        console.error('Instructor dashboard fetch failed', err);
        toast.error('Failed to load operational data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  if (!user || !user.userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-10 text-center max-w-md">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Identity Error</h2>
          <p className="text-gray-400 mb-8 font-medium italic">Unable to resolve your instructor node. Please try re-authenticating.</p>
          <Link to="/login" className="btn-cyber py-4 px-8 block w-full">Return to Login</Link>
        </div>
      </div>
    );
  }

  // Logic for verification banners
  if (user && (user.isVerified === false || user.isApproved === false)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="glass-card p-16 max-w-2xl border-yellow-500/30">
          <ExclamationCircleIcon className="h-24 w-24 text-yellow-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-6">Access <span className="text-yellow-500">Restricted</span></h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
            Your instructor node is currently under review. {user.isVerified ? 'Our administrative core is evaluating your profile.' : 'Please verify your email to initiate the review sequence.'}
          </p>
          {!user.isVerified && (
            <button className="btn-cyber py-4 px-12 bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20">
              Resend Verification Sync
            </button>
          )}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Modules', value: courses.length, icon: BookOpenIcon, color: 'text-[#3b82f6]' },
    { label: 'Total Operatives', value: stats.totalStudents, icon: UsersIcon, color: 'text-indigo-400' },
    { label: 'Revenue Stream', value: formatPrice(stats.totalRevenue), icon: CurrencyRupeeIcon, color: 'text-[#3b82f6]' },
  ];

  return (
    <div className="space-y-12 bg-dark-bg text-white min-h-screen pb-20">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3b82f6]/5 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Instructor <span className="text-[#3b82f6]">Terminal _</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg italic mt-2 tracking-tight">
            System status: <span className="text-green-400 font-black">Operational</span>. Managing {courses.length} active modules.
          </p>
        </div>
        <Link to="/instructor/courses/new" className="btn-cyber py-5 px-12 relative z-10">
          <PlusIcon className="h-5 w-5 mr-3" /> Initialize New Module
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl group-hover:bg-[#3b82f6]/10 transition-all"></div>
            <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="text-4xl font-black text-white mb-1 tracking-tighter italic">{stat.value}</div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Course List */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Active <span className="text-[#3b82f6]">Deployments</span></h2>
          <Link to="/instructor/courses" className="text-[10px] font-black text-[#3b82f6] hover:underline uppercase italic tracking-widest">All Modules</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <tr>
                <th className="px-10 py-6">Module</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courses.map((course) => (
                <tr key={course.courseId} className="hover:bg-[#3b82f6]/5 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img src={course.thumbnailUrl || 'https://via.placeholder.com/100'} className="h-14 w-24 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={course.title} />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-[#3b82f6] transition-colors">{course.title}</div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{course.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                      course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end space-x-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Link to={`/instructor/courses/${course.courseId}/edit`} className="p-3 bg-white/5 hover:bg-[#3b82f6]/10 text-gray-400 hover:text-[#3b82f6] rounded-xl border border-white/5 transition-all">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl border border-white/5 transition-all">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-10 py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    No active modules detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
