import React, { useEffect, useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { authApi } from '../../api/authApi';
import { courseApi } from '../../api/courseApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatUtils';
import { CurrencyRupeeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPaymentsWithDetails = async () => {
      try {
        const res = await paymentApi.getAllPayments();
        const rawPayments = res.data;

        // Use maps to cache fetched users and courses to prevent redundant API calls
        const userCache = new Map();
        const courseCache = new Map();

        const enrichedPayments = await Promise.all(
          rawPayments.map(async (payment) => {
            let studentName = 'Unknown Student';
            let courseTitle = 'Unknown Course';

            // Fetch or get student
            if (payment.studentId) {
              if (userCache.has(payment.studentId)) {
                studentName = userCache.get(payment.studentId);
              } else {
                try {
                  const userRes = await authApi.getProfile(payment.studentId);
                  studentName = userRes.data.fullName;
                  userCache.set(payment.studentId, studentName);
                } catch (err) {
                  console.error(`Failed to fetch user ${payment.studentId}`, err);
                }
              }
            }

            // Fetch or get course
            if (payment.courseId) {
              if (courseCache.has(payment.courseId)) {
                courseTitle = courseCache.get(payment.courseId);
              } else {
                try {
                  const courseRes = await courseApi.getCourseById(payment.courseId);
                  courseTitle = courseRes.data.title;
                  courseCache.set(payment.courseId, courseTitle);
                } catch (err) {
                  console.error(`Failed to fetch course ${payment.courseId}`, err);
                }
              }
            }

            return {
              ...payment,
              studentName,
              courseTitle: payment.courseId === 0 ? 'Platform Subscription' : courseTitle
            };
          })
        );

        // Sort by date descending
        enrichedPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

        setPayments(enrichedPayments);
        setFilteredPayments(enrichedPayments);
      } catch (err) {
        console.error('Failed to load payments history', err);
        toast.error('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsWithDetails();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = payments.filter(p => 
      p.transactionId?.toLowerCase().includes(term) ||
      p.studentName.toLowerCase().includes(term) ||
      p.courseTitle.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleApproveRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this refund?')) return;
    try {
      await paymentApi.approveRefund(paymentId);
      toast.success('Refund approved successfully');
      // Refresh the list
      const res = await paymentApi.getAllPayments();
      setPayments(res.data); // Simplified refresh
    } catch (err) {
      toast.error('Failed to approve refund');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payments History</h1>
          <p className="text-gray-500 mt-2 font-medium">Detailed log of all platform transactions and student payments.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student, course, or transaction ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{payment.transactionId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{formatDate(payment.paidAt)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{payment.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{payment.courseTitle}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-gray-900 flex items-center justify-end">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {payment.amount}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{payment.mode}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        payment.status === 'REFUNDED' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        payment.status === 'REFUND_REQUESTED' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {payment.status}
                      </span>
                      {payment.status === 'REFUND_REQUESTED' && (
                        <button
                          onClick={() => handleApproveRefund(payment.paymentId)}
                          className="text-[10px] font-black text-white bg-primary-600 px-2 py-1 rounded hover:bg-primary-700 transition-colors uppercase tracking-widest"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <CurrencyRupeeIcon className="w-full h-full" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No payments found</h3>
                    <p className="text-sm text-gray-500 mt-1">Adjust your search or check back later.</p>
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

export default AdminPaymentsPage;
