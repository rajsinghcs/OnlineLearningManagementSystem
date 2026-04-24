import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { courseApi } from '../../api/courseApi';
import { paymentApi } from '../../api/paymentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  UsersIcon, 
  CurrencyRupeeIcon, 
  AcademicCapIcon, 
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { formatPrice, formatDate } from '../../utils/formatUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [data, setData] = useState({
    users: [],
    courses: [],
    payments: [],
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, paymentsRes, revenueRes] = await Promise.all([
          authApi.getAllUsers(),
          courseApi.getAllCoursesAdmin(),
          paymentApi.getAllPayments(),
          paymentApi.getTotalRevenue()
        ]);
        setData({
          users: usersRes.data,
          courses: coursesRes.data,
          payments: paymentsRes.data.slice(0, 5),
          revenue: revenueRes.data
        });
      } catch (err) {
        console.error('Admin dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Users', value: data.users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Revenue', value: formatPrice(data.revenue), icon: CurrencyRupeeIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Courses', value: data.courses.length, icon: AcademicCapIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Reviews', value: data.courses.filter(c => c.status === 'PENDING').length, icon: ExclamationCircleIcon, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: '#3b82f6',
      borderRadius: 8
    }]
  };

  const doughnutData = {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [{
      data: [
        data.users.filter(u => u.role === 'STUDENT').length,
        data.users.filter(u => u.role === 'INSTRUCTOR').length,
        data.users.filter(u => u.role === 'ADMIN').length
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-gray-500 font-medium">System performance and management dashboard.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-900">Revenue Growth</h2>
            <Link to="/admin/analytics" className="text-sm font-bold text-primary-600 hover:underline">Full Report</Link>
          </div>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-8">User Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Courses */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Pending Approvals</h2>
            <Link to="/admin/courses" className="text-sm font-bold text-primary-600 hover:underline">Review All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.courses.filter(c => c.status === 'PENDING').slice(0, 4).map(course => (
              <div key={course.courseId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <img src={course.thumbnailUrl || 'https://via.placeholder.com/100'} className="h-10 w-16 rounded-lg object-cover" />
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{course.title}</div>
                    <div className="text-xs text-gray-400">By {course.instructorName}</div>
                  </div>
                </div>
                <Link to="/admin/courses" className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <ArrowUpRightIcon className="h-5 w-5" />
                </Link>
              </div>
            ))}
            {data.courses.filter(c => c.status === 'PENDING').length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm italic">No courses waiting for review.</div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/admin/payments" className="text-sm font-bold text-primary-600 hover:underline">View History</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.payments.map(p => (
              <div key={p.transactionId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">₹{p.amount}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(p.paidAt)}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                  p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
