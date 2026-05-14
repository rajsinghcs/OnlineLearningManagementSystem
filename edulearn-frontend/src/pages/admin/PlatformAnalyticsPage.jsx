import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/authApi';
import { courseApi } from '../../api/courseApi';
import { paymentApi } from '../../api/paymentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { formatPrice } from '../../utils/formatUtils';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PlatformAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalRevenue: 0,
    categoryData: { labels: [], datasets: [] },
    revenueData: { labels: [], datasets: [] },
    userGrowthData: { labels: [], datasets: [] }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, paymentsRes, coursesRes] = await Promise.all([
          authApi.getAllUsers(),
          paymentApi.getAllPayments(),
          courseApi.getAllCoursesAdmin()
        ]);

        const users = usersRes.data || [];
        const payments = paymentsRes.data || [];
        const courses = coursesRes.data || [];

        const students = users.filter(u => u.role === 'STUDENT');
        const instructors = users.filter(u => u.role === 'INSTRUCTOR');
        
        const totalRev = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // 1. Category breakdown for Doughnut Chart
        const categories = {};
        courses.forEach(c => {
          const cat = c.category || 'General';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        const categoryChartData = {
          labels: Object.keys(categories),
          datasets: [
            {
              label: 'Courses',
              data: Object.values(categories),
              backgroundColor: [
                'rgba(79, 70, 229, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
              ],
              borderWidth: 1
            }
          ]
        };

        // 2. Revenue by Course for Bar Chart
        const revByCourse = {};
        payments.forEach(p => {
          const course = courses.find(c => c.courseId === p.courseId);
          const title = course ? course.title.substring(0, 15) + '...' : `Course #${p.courseId}`;
          revByCourse[title] = (revByCourse[title] || 0) + p.amount;
        });

        const revenueChartData = {
          labels: Object.keys(revByCourse),
          datasets: [
            {
              label: 'Revenue (₹)',
              data: Object.values(revByCourse),
              backgroundColor: 'rgba(79, 70, 229, 0.7)',
              borderColor: 'rgba(79, 70, 229, 1)',
              borderWidth: 1
            }
          ]
        };

        // 3. Simulated user growth for Line Chart
        const userGrowthChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Users Joined',
              data: [users.length > 3 ? 1 : 0, users.length > 4 ? 2 : 1, users.length > 5 ? 3 : 2, users.length, users.length, users.length],
              borderColor: 'rgba(16, 185, 129, 1)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        };

        setAnalytics({
          totalUsers: users.length,
          totalStudents: students.length,
          totalInstructors: instructors.length,
          totalCourses: courses.length,
          totalRevenue: totalRev,
          categoryData: categoryChartData,
          revenueData: revenueChartData,
          userGrowthData: userGrowthChartData
        });
      } catch (err) {
        console.error('Error computing analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const statCards = [
    { title: 'Platform Users', value: analytics.totalUsers, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Students', value: analytics.totalStudents, icon: AcademicCapIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active Courses', value: analytics.totalCourses, icon: ChartBarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Gross Revenue', value: formatPrice(analytics.totalRevenue), icon: CurrencyRupeeIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Analytics</h1>
        <p className="text-gray-500 font-medium mt-2">Comprehensive metrics mapping business growth and interaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-gray-900 block">{stat.value}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.title}</span>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Revenue distribution per course</h3>
          <div className="h-80">
            <Bar 
              data={analytics.revenueData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Courses by Category</h3>
          <div className="h-80 flex justify-center">
            <Doughnut 
              data={analytics.categoryData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">User Growth Trajectory</h3>
          <div className="h-80">
            <Line 
              data={analytics.userGrowthData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalyticsPage;
