import React, { useEffect, useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { authApi } from '../../api/authApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatUtils';
import { TicketIcon, MagnifyingGlassIcon, CheckBadgeIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubscriptionsWithDetails = async () => {
      try {
        const [subRes, usersRes] = await Promise.all([
          paymentApi.getAllSubscriptions(),
          authApi.getAllUsers()
        ]);
        
        const allUsers = usersRes.data || [];
        const enriched = (subRes.data || []).map(sub => ({
          ...sub,
          studentName: allUsers.find(u => u.userId === sub.studentId)?.fullName || `Student #${sub.studentId}`,
          email: allUsers.find(u => u.userId === sub.studentId)?.email || 'N/A'
        }));

        // Sort by start date descending
        enriched.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        setSubscriptions(enriched);
        setFilteredSubscriptions(enriched);
      } catch (err) {
        console.error('Failed to load subscriptions', err);
        toast.error('Failed to load subscription data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionsWithDetails();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = subscriptions.filter(s => 
      s.studentName.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.plan.toLowerCase().includes(term) ||
      s.status.toLowerCase().includes(term) ||
      s.subscriptionId.toString().includes(term)
    );
    setFilteredSubscriptions(filtered);
  }, [searchTerm, subscriptions]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
            <TicketIcon className="h-8 w-8 text-primary-600" />
            <span>Platform Subscriptions</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and monitor all student subscription plans and active memberships.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student, email, or plan..." 
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
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Sub ID</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.subscriptionId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">#{sub.subscriptionId}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{sub.studentName}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{sub.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      sub.plan === 'ANNUAL' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                      sub.plan === 'MONTHLY' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-900 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 text-gray-400" />
                      {formatDate(sub.startDate)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">to {formatDate(sub.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-gray-900">{formatPrice(sub.amountPaid)}</div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      {sub.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 
                      sub.status === 'CANCELLED' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {sub.status === 'ACTIVE' ? <CheckBadgeIcon className="h-3 w-3 mr-1" /> : <XCircleIcon className="h-3 w-3 mr-1" />}
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <TicketIcon className="w-full h-full" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No subscriptions found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term or check system logs.</p>
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

export default AdminSubscriptionsPage;
