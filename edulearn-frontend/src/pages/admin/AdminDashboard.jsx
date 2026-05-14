import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { courseApi } from '../../api/courseApi';
import { paymentApi } from '../../api/paymentApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  UsersIcon, 
  CurrencyRupeeIcon, 
  AcademicCapIcon, 
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  ShieldCheckIcon
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
    transactions: [],
    revenue: 0,
    enrollmentCount: 0,
    monthlyRevenue: { labels: [], values: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, paymentsRes, revenueRes, enrollmentCountRes, subscriptionsRes] = await Promise.all([
          authApi.getAllUsers().catch(() => ({ data: [] })),
          courseApi.getAllCoursesAdmin().catch(() => ({ data: [] })),
          paymentApi.getAllPayments().catch(() => ({ data: [] })),
          paymentApi.getTotalRevenue().catch(() => ({ data: 0 })),
          enrollmentApi.getTotalEnrollmentCount().catch(() => ({ data: 0 })),
          paymentApi.getAllSubscriptions().catch(() => ({ data: [] }))
        ]);
        
        const mappedCourses = (coursesRes.data || []).map(c => ({
          ...c,
          status: c.published ? 'PUBLISHED' : (c.rejected ? 'REJECTED' : (c.approved ? 'APPROVED' : 'PENDING'))
        }));
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          last6Months.push({
            month: monthNames[d.getMonth()],
            year: d.getFullYear(),
            amount: 0,
            monthIndex: d.getMonth()
          });
        }

        const payments = paymentsRes.data || [];
        payments.forEach(p => {
          if (p.status === 'SUCCESS' && p.paidAt) {
            const date = new Date(p.paidAt);
            const pMonth = date.getMonth();
            const pYear = date.getFullYear();
            const found = last6Months.find(m => m.monthIndex === pMonth && m.year === pYear);
            if (found) found.amount += p.amount;
          }
        });

        const subscriptions = subscriptionsRes.data || [];
        subscriptions.forEach(s => {
          if (s.amountPaid && s.startDate) {
            const date = new Date(s.startDate);
            const sMonth = date.getMonth();
            const sYear = date.getFullYear();
            const found = last6Months.find(m => m.monthIndex === sMonth && m.year === sYear);
            if (found) found.amount += s.amountPaid;
          }
        });

        const allUsers = usersRes.data || [];
        const rawPayments = (payments).map(p => ({
          ...p,
          id: p.paymentId,
          type: 'PURCHASE',
          date: p.paidAt,
          studentName: allUsers.find(u => u.userId === p.studentId)?.fullName || 'Unknown Student'
        }));

        const rawSubscriptions = (subscriptions).map(s => ({
          ...s,
          id: `SUB-${s.subscriptionId}`,
          amount: s.amountPaid,
          type: 'SUB',
          date: s.startDate,
          studentName: allUsers.find(u => u.userId === s.studentId)?.fullName || 'Unknown Student'
        }));

        const mergedTransactions = [...rawPayments, ...rawSubscriptions]
          .filter(t => t.amount > 0)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

        setData({
          users: allUsers,
          courses: mappedCourses,
          transactions: mergedTransactions,
          revenue: revenueRes.data || 0,
          enrollmentCount: enrollmentCountRes.data || 0,
          monthlyRevenue: { 
            labels: last6Months.map(m => m.month), 
            values: last6Months.map(m => m.amount) 
          }
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
    { label: 'Total Synchronizations', value: data.enrollmentCount, icon: UsersIcon, color: 'text-[#3b82f6]' },
    { label: 'Network Revenue', value: formatPrice(data.revenue), icon: CurrencyRupeeIcon, color: 'text-indigo-400', link: '/admin/payments' },
    { label: 'Available Modules', value: data.courses.length, icon: AcademicCapIcon, color: 'text-[#3b82f6]' },
    { label: 'Pending Validations', value: data.courses.filter(c => c.status === 'PENDING').length, icon: ExclamationCircleIcon, color: 'text-red-500' },
  ];

  const barOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, border: { display: false }, ticks: { color: '#64748b', font: { family: 'Outfit', weight: 'bold', size: 10 } } },
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#64748b', font: { family: 'Outfit', weight: 'bold', size: 10 } } }
    }
  };

  const barData = {
    labels: data.monthlyRevenue.labels,
    datasets: [{
      label: 'Revenue',
      data: data.monthlyRevenue.values,
      backgroundColor: '#3b82f6',
      borderRadius: 12,
      borderSkipped: false,
    }]
  };

  const doughnutData = {
    labels: ['STUDENTS', 'INSTRUCTORS', 'ADMINS'],
    datasets: [{
      data: [
        data.users.filter(u => u.role === 'STUDENT').length,
        data.users.filter(u => u.role === 'INSTRUCTOR').length,
        data.users.filter(u => u.role === 'ADMIN').length
      ],
      backgroundColor: ['#3b82f6', '#818cf8', '#1e293b'],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  return (
    <div className="space-y-12 bg-dark-bg text-white min-h-screen pb-20">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[150px]"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Admin <span className="text-[#3b82f6]">Command _</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg italic mt-2 tracking-tight">
            System status: <span className="text-[#3b82f6] font-black">SUPERUSER_ACTIVE</span>. Core oversight operational.
          </p>
        </div>
        <div className="flex space-x-4 relative z-10">
          <Link to="/admin/analytics" className="btn-cyber py-5 px-10">
            Full Telemetry <ChartBarIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl group-hover:bg-[#3b82f6]/10 transition-all"></div>
            <div className={`p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 transition-transform inline-block`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="text-4xl font-black text-white mb-1 tracking-tighter italic">{stat.value}</div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-10">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Revenue <span className="text-[#3b82f6]">Growth</span></h2>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">6 Month Telemetry</div>
          </div>
          <div className="h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="glass-card p-10">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">Node <span className="text-[#3b82f6]">Distribution</span></h2>
          <div className="h-64 relative">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white italic">{data.users.length}</span>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Nodes</span>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            {['STUDENTS', 'INSTRUCTORS', 'ADMINS'].map((role, i) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${['bg-[#3b82f6]', 'bg-[#818cf8]', 'bg-[#1e293b]'][i]}`}></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{role}</span>
                </div>
                <span className="text-xs font-black text-white italic">{data.users.filter(u => u.role === role).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pending Courses */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Pending <span className="text-red-500">Validations</span></h2>
            <Link to="/admin/courses" className="text-[10px] font-black text-[#3b82f6] hover:underline uppercase italic tracking-widest">Review All</Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.courses.filter(c => c.status === 'PENDING').slice(0, 5).map(course => (
              <div key={course.courseId} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img src={course.thumbnailUrl || 'https://via.placeholder.com/100'} className="h-12 w-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={course.title} />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                  </div>
                  <div>
                    <div className="text-md font-black text-white uppercase italic tracking-tighter group-hover:text-[#3b82f6] transition-colors">{course.title}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Instructor: {course.instructorName}</div>
                  </div>
                </div>
                <Link to="/admin/courses" className="p-3 bg-[#3b82f6] text-white rounded-xl shadow-lg shadow-[#3b82f6]/20 hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="h-5 w-5" />
                </Link>
              </div>
            ))}
            {data.courses.filter(c => c.status === 'PENDING').length === 0 && (
              <div className="p-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No modules pending validation.</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recent <span className="text-[#3b82f6]">Packets</span></h2>
            <Link to="/admin/payments" className="text-[10px] font-black text-[#3b82f6] hover:underline uppercase italic tracking-widest">History _</Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.transactions.map(t => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center space-x-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-[#3b82f6]/30 transition-all`}>
                    {t.type === 'SUB' ? (
                      <CheckBadgeIcon className="h-6 w-6 text-indigo-400" />
                    ) : (
                      <CurrencyRupeeIcon className="h-6 w-6 text-[#3b82f6]" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-black text-white italic tracking-tighter">₹{t.amount}</div>
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
                      {t.type} • {t.studentName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{formatDate(t.date)}</div>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    t.type === 'SUB' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30'
                  }`}>
                    Successful
                  </span>
                </div>
              </div>
            ))}
            {data.transactions.length === 0 && (
              <div className="p-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No transactions detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
