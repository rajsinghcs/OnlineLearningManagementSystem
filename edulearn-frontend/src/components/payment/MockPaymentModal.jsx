import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const MockPaymentModal = ({ isOpen, onClose, course, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Call success handler after showing success animation
      setTimeout(() => {
        onSuccess({ razorpay_payment_id: `mock_txn_${Date.now()}` });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-primary-600">
            <CreditCardIcon className="h-6 w-6" />
            <span className="font-bold text-lg">Secure Checkout</span>
          </div>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-gray-900">Payment Successful!</h3>
              <p className="text-gray-500 font-medium">Redirecting to your dashboard...</p>
            </div>
          ) : isProcessing ? (
            <div className="text-center py-12 space-y-4">
              <LoadingSpinner />
              <p className="text-gray-600 font-bold animate-pulse">Processing your payment...</p>
              <p className="text-xs text-gray-400">Please do not close this window</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Order Summary</p>
                <h4 className="font-bold text-gray-900 leading-tight">{course?.title}</h4>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₹{course?.price}</span>
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 opacity-70">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">Test Card</span>
                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-600">MOCK</span>
                  </div>
                  <div className="text-sm text-gray-500 tracking-widest font-mono">
                    •••• •••• •••• 1111
                  </div>
                </div>
                
                <button 
                  onClick={handlePay}
                  className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/30 rounded-xl"
                >
                  Pay ₹{course?.price} Now
                </button>
                <p className="text-xs text-center text-gray-400">
                  This is a simulated test payment environment. No real money is charged.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
