import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      
      // Defensive extraction of token and user data
      const token = res.data.token || res.data.data?.token;
      const userData = res.data.user || res.data.data?.user || res.data;
      
      if (!token) {
        throw new Error('Authentication failed: No token received.');
      }

      setAuth(token, userData);
      
      toast.success('Authentication Successful');
      
      // Determine role safely
      const role = userData.role || 'STUDENT';
      
      console.log('Login successful. Role:', role);

      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Authentication Failed';
      toast.error(errorMsg);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sparkle-bg min-h-[90vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[120px]"></div>

      <div className="glass-card w-full max-w-xl relative z-10 p-12 md:p-16">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="relative">
              <AcademicCapIcon className="h-12 w-12 text-[#3b82f6] group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-[#3b82f6] blur-xl opacity-30"></div>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase italic">Edu<span className="text-[#3b82f6]">Learn</span></span>
          </Link>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Central <span className="text-[#3b82f6]">Login</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Access your digital learning node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                placeholder="OPERATIVE@EDULEARN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Access Key</label>
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-cyber w-full py-6 text-sm flex items-center justify-center space-x-3"
          >
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}
          </button>
        </form>

        <div className="mt-12 text-center space-y-4">
          <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-gray-500 hover:text-[#3b82f6] uppercase tracking-widest block transition-colors">Recover Access Key?</Link>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            New operative? <Link to="/register" className="text-[#3b82f6] hover:underline">Initiate Registration</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
