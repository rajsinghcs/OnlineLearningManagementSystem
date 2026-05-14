import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(formData);
      toast.success('Registration Initiated. Please verify your email.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sparkle-bg min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3b82f6]/5 rounded-full blur-[150px]"></div>

      <div className="glass-card w-full max-w-2xl relative z-10 p-12 md:p-16">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="relative">
              <AcademicCapIcon className="h-12 w-12 text-[#3b82f6] group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-[#3b82f6] blur-xl opacity-30"></div>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase italic">Edu<span className="text-[#3b82f6]">Learn</span></span>
          </Link>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">New <span className="text-[#3b82f6]">Node</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initialize your digital profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Full Designation</label>
              <input 
                type="text" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                placeholder="OPERATIVE NAME"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Secure Email</label>
              <input 
                type="email" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                placeholder="OPERATIVE@EDULEARN.COM"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Access Key</label>
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                placeholder="CREATE SECURE KEY"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            {/* Restoring Role Selection Logic */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-2">Operational Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'STUDENT'})}
                  className={`py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border transition-all ${
                    formData.role === 'STUDENT' 
                    ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'INSTRUCTOR'})}
                  className={`py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border transition-all ${
                    formData.role === 'INSTRUCTOR' 
                    ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                  }`}
                >
                  Instructor
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-cyber w-full py-6 text-sm"
          >
            {loading ? 'INITIALIZING...' : 'ESTABLISH NEW NODE'}
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
          Already registered? <Link to="/login" className="text-[#3b82f6] hover:underline">Sync Connection</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
