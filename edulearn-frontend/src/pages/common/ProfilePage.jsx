import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  SparklesIcon,
  PencilSquareIcon,
  CameraIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user: authUser, setUser: setAuthUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    mobile: '',
    profilePicUrl: '',
    learningGoals: '',
    expertiseAreas: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile(authUser.userId);
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          bio: res.data.bio || '',
          mobile: res.data.mobile || '',
          profilePicUrl: res.data.profilePicUrl || '',
          learningGoals: res.data.learningGoals || '',
          expertiseAreas: res.data.expertiseAreas || ''
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authUser.userId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicUrl: reader.result });
        setUploading(false);
        toast.success('Image selected! Save changes to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, profilePicUrl: '' });
    toast.success('Photo removed! Save changes to persist.');
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        mobile: formData.mobile && formData.mobile.trim() !== '' ? Number(formData.mobile) : null
      };
      
      const res = await authApi.updateProfile(authUser.userId, dataToSave);
      setProfile(res.data);
      setAuthUser({ ...authUser, ...res.data });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Update failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.')) {
      try {
        await authApi.deleteUser(authUser.userId);
        toast.success('Account deleted successfully');
        logout();
        navigate('/');
      } catch (err) {
        toast.error('Failed to delete account');
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-4 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Profile <span className="text-[#3b82f6]">_</span></h1>
        <button 
          onClick={() => setEditing(!editing)}
          className={`btn-cyber flex items-center space-x-3 py-4 px-10 ${
            editing ? 'bg-white/10 text-white' : ''
          }`}
        >
          <PencilSquareIcon className="h-5 w-5" />
          <span>{editing ? 'Cancel' : 'Modify Node'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 text-center space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl group-hover:bg-[#3b82f6]/10 transition-all"></div>
            <div className="relative inline-block group/img">
              <div className="w-40 h-40 rounded-3xl bg-white/5 flex items-center justify-center text-[#3b82f6] text-5xl font-black shadow-2xl mx-auto overflow-hidden border border-white/10 ring-4 ring-[#3b82f6]/10">
                {editing ? (
                   formData.profilePicUrl ? (
                    <img src={formData.profilePicUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    formData.fullName.charAt(0)
                  )
                ) : (
                  profile.profilePicUrl ? (
                    <img src={profile.profilePicUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    profile.fullName.charAt(0)
                  )
                )}
                
                {editing && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer rounded-3xl"
                  >
                    <CameraIcon className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              
              {editing && formData.profilePicUrl && (
                <button 
                  onClick={removePhoto}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove Photo"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <div>
              <h2 className="text-3xl font-black text-white leading-tight italic tracking-tighter uppercase">{profile.fullName}</h2>
              <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.3em] mt-3 italic">{profile.role} _</p>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col space-y-4">
              <div className="flex items-center justify-center space-x-3 text-xs font-medium text-gray-400">
                <EnvelopeIcon className="h-4 w-4 text-[#3b82f6]" />
                <span>{profile.email}</span>
              </div>
              {profile.mobile && (
                <div className="flex items-center justify-center space-x-3 text-xs font-medium text-gray-400">
                  <PhoneIcon className="h-4 w-4 text-[#3b82f6]" />
                  <span>{profile.mobile}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form/Info */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card p-10 md:p-12">
            {editing ? (
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Designation</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Bio & Data</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all min-h-[120px]"
                    placeholder="Describe your capabilities..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Secure Link (Mobile)</label>
                  <input 
                    type="tel" 
                    value={formData.mobile} 
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    placeholder="Operational ID"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">System Status</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center italic">
                    {profile.isVerified ? 'VERIFIED_ACTIVE' : 'PENDING_VALIDATION'}
                  </div>
                </div>

                {profile.role === 'STUDENT' && (
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Learning Targets</label>
                    <textarea 
                      value={formData.learningGoals} 
                      onChange={(e) => setFormData({...formData, learningGoals: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                      placeholder="Specify your objectives..."
                    />
                  </div>
                )}

                {profile.role === 'INSTRUCTOR' && (
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Expertise Fields</label>
                    <input 
                      type="text" 
                      value={formData.expertiseAreas} 
                      onChange={(e) => setFormData({...formData, expertiseAreas: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                      placeholder="E.g. NEURAL_NETS, QUANTUM_UX"
                    />
                  </div>
                )}

                <div className="md:col-span-2 pt-6">
                  <button type="submit" disabled={uploading} className="btn-cyber w-full py-5 text-sm">
                    {uploading ? 'UPLOADING_DATA...' : 'COMMIT CHANGES'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-12">
                <section className="space-y-6">
                  <h3 className="flex items-center space-x-3 text-xl font-black text-white uppercase italic tracking-tighter">
                    <UserIcon className="h-6 w-6 text-[#3b82f6]" />
                    <span>Neural <span className="text-[#3b82f6]">Bio</span></span>
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-medium text-lg italic">
                    {profile.bio || "No data stream available. Initialize your bio."}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/5">
                  {profile.role === 'STUDENT' && (
                    <section className="space-y-6">
                      <h3 className="flex items-center space-x-3 text-[10px] font-black text-white uppercase tracking-[0.3em]">
                        <SparklesIcon className="h-5 w-5 text-[#3b82f6]" />
                        <span>Learning Targets</span>
                      </h3>
                      <div className="bg-[#3b82f6]/5 p-8 rounded-3xl border border-[#3b82f6]/20 text-[#3b82f6] text-sm font-black italic uppercase tracking-wider">
                        {profile.learningGoals || "Establish objectives."}
                      </div>
                    </section>
                  )}

                  {profile.role === 'INSTRUCTOR' && (
                    <section className="space-y-6">
                      <h3 className="flex items-center space-x-3 text-[10px] font-black text-white uppercase tracking-[0.3em]">
                        <AcademicCapIcon className="h-5 w-5 text-[#3b82f6]" />
                        <span>Expertise Fields</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {(profile.expertiseAreas || "No fields set").split(',').map((area, i) => (
                          <span key={i} className="px-5 py-2 bg-white/5 text-[#3b82f6] rounded-xl text-[10px] font-black border border-white/10 uppercase tracking-widest italic">
                            {area.trim()}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card border-red-500/20 bg-red-500/5 p-10 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all"></div>
            <section className="space-y-8 relative z-10">
              <h3 className="flex items-center space-x-3 text-xl font-black text-red-500 uppercase italic tracking-tighter">
                <ExclamationTriangleIcon className="h-7 w-7" />
                <span>Termination <span className="text-red-600/50">Zone</span></span>
              </h3>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-white font-black uppercase italic tracking-tighter text-lg">Deactivate Account</p>
                  <p className="text-gray-500 text-sm font-medium mt-2">Permanently erase your node from the network. This action is irreversible.</p>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-8 py-4 bg-transparent border-2 border-red-500/30 text-red-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg shadow-red-500/5"
                >
                  DEACTIVATE_NODE
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
