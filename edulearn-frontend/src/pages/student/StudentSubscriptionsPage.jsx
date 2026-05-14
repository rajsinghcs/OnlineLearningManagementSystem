import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../api/paymentApi';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, CalendarIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import MockPaymentModal from '../../components/payment/MockPaymentModal';

const StudentSubscriptionsPage = () => {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const studentId = user?.userId || user?.id;
      const response = await paymentApi.getSubscriptionByStudent(studentId);
      setSubscription(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSubscription(null);
      } else {
        toast.error('Failed to load subscription details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    setSelectedPlan(planType);
    
    if (!window.Razorpay) {
      toast.error("Razorpay script not loaded. Falling back to mock payment.");
      setShowMockPayment(true);
      return;
    }
    
    const amount = planType === 'MONTHLY' ? 1999 : 19999;
    
    const options = {
      key: "rzp_test_Sip4hhQ75N6HrV",
      amount: amount * 100, // paise
      currency: "INR",
      name: "EduLearn LMS",
      description: `${planType === 'YEARLY' ? 'Annual' : 'Monthly'} Subscription`,
      image: "https://via.placeholder.com/150",
      handler: async function (response) {
        await finalizeSubscription(planType, response.razorpay_payment_id);
      },
      prefill: {
        name: user?.fullName || "Student",
        email: user?.email || "student@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#4F46E5"
      }
    };
    
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response){
      toast.error(`Payment failed: ${response.error.description}`);
    });
    
    rzp.open();
  };

  const finalizeSubscription = async (planType, transactionId) => {
    try {
      setActionLoading(true);
      
      const amount = planType === 'MONTHLY' ? 1999 : 19999;
      const studentId = user?.userId || user?.id;
      
      await paymentApi.subscribe({
        studentId: studentId,
        planType: planType,
        transactionId: transactionId,
        mode: "RAZORPAY"
      });
      toast.success(`Successfully subscribed to ${planType} plan!`);
      setShowMockPayment(false);
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to subscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMockPaymentSuccess = async (response) => {
    await finalizeSubscription(selectedPlan, response.razorpay_payment_id);
  };

  const handleCancel = async () => {
    if (!subscription) return;

    const startDate = new Date(subscription.startDate);
    const now = new Date();
    const hoursPassed = (now - startDate) / (1000 * 60 * 60);
    
    let isEligibleForRefund = false;
    if (subscription.plan === 'ANNUAL' && hoursPassed <= 360) {
      isEligibleForRefund = true;
    } else if (subscription.plan === 'MONTHLY' && hoursPassed <= 48) {
      isEligibleForRefund = true;
    }

    const message = isEligibleForRefund 
      ? 'Are you sure you want to cancel? You are within the refund period, so you will receive an automatic refund.'
      : 'Are you sure you want to cancel? The refund period has passed, so no automatic refund will be issued. You can request a manual refund from the admin after cancelling.';

    if (!window.confirm(message)) return;

    try {
      setActionLoading(true);
      await paymentApi.cancelSubscription(subscription.subscriptionId || subscription.id);
      toast.success(isEligibleForRefund ? 'Subscription cancelled and refund processed!' : 'Subscription cancelled.');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    try {
      setActionLoading(true);
      await paymentApi.requestRefund(subscription.subscriptionId || subscription.id);
      toast.success('Refund request sent to admin successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to send refund request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    try {
      setActionLoading(true);
      await paymentApi.renewSubscription(subscription.subscriptionId);
      toast.success('Subscription renewed successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to renew subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const availablePlans = [
    {
      type: 'MONTHLY',
      price: '₹1,999',
      features: ['Access to all courses', 'Cancel anytime', 'Monthly billing', 'Community access'],
      recommended: false
    },
    {
      type: 'ANNUAL',
      price: '₹19,999',
      features: ['Access to all courses', 'Save 16%', 'Yearly billing', 'Priority support'],
      recommended: true
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isActive = subscription && subscription.status === 'ACTIVE';

  return (
    <div className="max-w-5xl mx-auto py-8">
      <MockPaymentModal
        isOpen={showMockPayment}
        onClose={() => setShowMockPayment(false)}
        course={{ 
          title: `${selectedPlan === 'ANNUAL' ? 'Annual' : 'Monthly'} Subscription`, 
          price: selectedPlan === 'MONTHLY' ? 1999 : 19999 
        }}
        onSuccess={handleMockPaymentSuccess}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="mt-2 text-gray-600">Manage your subscription plan and billing cycle.</p>
      </div>

      {subscription ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {subscription.plan === 'ANNUAL' ? 'Annual Plan' : 'Monthly Plan'}
                </h2>
                {isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="mr-1.5 h-4 w-4" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="mr-1.5 h-4 w-4" /> {subscription.status || 'Inactive'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-600">Subscription ID: {subscription.subscriptionId || subscription.id}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {isActive ? (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  {subscription.status === 'CANCELLED' && (
                    <button
                      onClick={handleRequestRefund}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-600 border border-transparent text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
                    >
                      Request Refund
                    </button>
                  )}
                  <button
                    onClick={handleRenew}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-primary-600 border border-transparent text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" /> Renew Plan
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-primary-50 p-3 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Billing Cycle</h3>
                <p className="mt-1 text-gray-500">
                  Your plan started on <span className="font-medium text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</span>
                  <br />
                  Next billing date is <span className="font-medium text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-primary-50 p-3 rounded-xl">
                <CreditCardIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                <p className="mt-1 text-gray-500">
                  Payments are managed securely via Razorpay.
                  <br />
                  <span className="text-sm">Receipts are sent to {user.email}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You don't have an active subscription. Choose a plan below to get unlimited access to all courses!
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {availablePlans.map((plan) => (
              <div 
                key={plan.type} 
                className={`relative bg-white rounded-2xl shadow-sm border ${
                  plan.recommended ? 'border-primary-500 shadow-md transform md:-translate-y-2' : 'border-gray-200'
                } p-8 flex flex-col transition-transform duration-300`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Recommended
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.type === 'ANNUAL' ? 'Annual' : 'Monthly'} Plan</h3>
                  <div className="flex items-baseline text-4xl font-extrabold text-gray-900">
                    {plan.price}
                    <span className="ml-1 text-xl font-medium text-gray-500">/{plan.type === 'ANNUAL' ? 'year' : 'mo'}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.type)}
                  disabled={actionLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                    plan.recommended 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubscriptionsPage;
