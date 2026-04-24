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
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/formatUtils';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseApi.getCoursesByInstructor(user.userId);
        setCourses(res.data);
        
        // Simulating aggregate stats for now as we don't have a single endpoint for this
        let students = 0;
        for (const c of res.data) {
          const countRes = await enrollmentApi.getEnrollmentCount(c.courseId);
          students += countRes.data;
        }
        setStats({ totalStudents: students, totalRevenue: 0 }); // Revenue would come from payment service
      } catch (err) {
        console.error('Instructor dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.userId]);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Courses', value: courses.length, icon: BookOpenIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: stats.totalStudents, icon: UsersIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: CurrencyRupeeIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Rating', value: '4.7', icon: ChartBarSquareIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Instructor Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome back! Here's how your courses are performing.</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary py-3 px-6 flex items-center rounded-xl shadow-lg shadow-primary-200">
          <PlusIcon className="h-5 w-5 mr-2" /> Create New Course
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
          <Link to="/instructor/courses" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((course) => (
                <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={course.thumbnailUrl || 'https://via.placeholder.com/100'} className="h-10 w-16 rounded-lg object-cover" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-400">{course.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">0</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(course.price)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/instructor/courses/${course.courseId}/edit`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                        <PlusIcon className="h-5 w-5" title="Edit" />
                      </Link>
                      <Link to={`/instructor/courses/${course.courseId}/lessons`} className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-all">
                        <BookOpenIcon className="h-5 w-5" title="Lessons" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 text-sm italic">You haven't created any courses yet.</td>
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
