import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { registerSchema } from '../../utils/validationSchemas';
import { authApi } from '../../api/authApi';
import { AcademicCapIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: 'STUDENT' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.register(data);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email already exists or registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join thousands of learners on EduLearn today.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                {...register('fullName')}
                type="text"
                className={`appearance-none block w-full px-4 py-3 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>}
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                {...register('email')}
                type="email"
                className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className={`appearance-none block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-3">Join as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedRole === 'STUDENT' ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" {...register('role')} value="STUDENT" className="sr-only" />
                  <UserIcon className={`h-8 w-8 mb-2 ${selectedRole === 'STUDENT' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'STUDENT' ? 'text-primary-700' : 'text-gray-600'}`}>Student</span>
                </label>
                <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedRole === 'INSTRUCTOR' ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" {...register('role')} value="INSTRUCTOR" className="sr-only" />
                  <UserPlusIcon className={`h-8 w-8 mb-2 ${selectedRole === 'INSTRUCTOR' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'INSTRUCTOR' ? 'text-primary-700' : 'text-gray-600'}`}>Instructor</span>
                </label>
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-600 font-medium text-center">{errors.role.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-primary-500/25"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
