import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { certificateApi } from '../../api/certificateApi';
import { courseApi } from '../../api/courseApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckBadgeIcon, ArrowDownTrayIcon, ShareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CertificateViewPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          // ProtectedRoute should handle this, but for safety:
          return;
        }

        // 1. Fetch course details
        const courseRes = await courseApi.getCourseById(courseId);
        setCourse(courseRes.data);

        // 2. Fetch or issue certificate
        try {
          const certsRes = await certificateApi.getByStudent(user.userId);
          const existingCert = certsRes.data.find(c => c.courseName === courseRes.data.title);
          
          if (existingCert) {
            setCertificate(existingCert);
          } else {
            setCertificate(null); // No cert/request yet
          }
        } catch (err) {
          console.error('Failed to handle certificate', err);
          toast.error('Failed to load certificate. Please ensure course is 100% complete.');
        }
      } catch (err) {
        console.error('Failed to fetch course', err);
        toast.error('Course not found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  const handleRequest = async () => {
    if (!user || !course) {
      toast.error('Session or course data missing. Please refresh.');
      return;
    }

    try {
      setLoading(true);
      const res = await certificateApi.request({
        studentId: user.userId?.toString() || '',
        studentName: user.fullName || user.username || 'Student',
        studentEmail: user.email || '',
        courseName: course.title,
        grade: 'A+' // Should be dynamic in a real app
      });
      setCertificate(res.data);
      toast.success('Certificate requested successfully!');
    } catch (err) {
      console.error('Certificate request failed:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || `Failed to request certificate (${err.response?.status || 'Unknown error'})`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate || certificate.status !== 'ISSUED') return;
    try {
      const res = await certificateApi.download(certificate.certificateNumber);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download certificate');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-primary-50 p-6 rounded-full mb-6">
          <CheckBadgeIcon className="h-16 w-16 text-primary-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Claim Your Certificate</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
          Congratulations! You've completed the course. Request your official certificate now to showcase your achievement.
        </p>
        <button onClick={handleRequest} className="btn-primary px-8 py-3 rounded-xl bg-primary-600 text-white font-bold">Request Certificate</button>
      </div>
    );
  }

  if (certificate.status === 'REQUESTED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-amber-50 p-6 rounded-full mb-6 animate-pulse">
          <CheckBadgeIcon className="h-16 w-16 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Request Submitted Successfully!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
          Your certificate request has been received. Please wait for **24 hours** for admin approval. Happy learning!
        </p>
        <button onClick={() => navigate('/student/dashboard')} className="btn-primary px-8 py-3 rounded-xl bg-primary-600 text-white font-bold">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center space-x-2 text-primary-600 font-black text-xs uppercase tracking-widest mb-2">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Verified Achievement</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Course Certificate</h1>
          <p className="text-gray-500 mt-2 font-medium">Congratulations on your successful completion of the course!</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
          <button 
            className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-colors shadow-sm"
            onClick={() => toast('Sharing coming soon!')}
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden relative group">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600"></div>
        <div className="absolute top-10 right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <CheckBadgeIcon className="h-64 w-64 text-primary-900" />
        </div>

        <div className="p-12 md:p-20 text-center relative z-10">
          <div className="mb-12">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-4">EduLearn Academy</h2>
            <div className="h-1 w-20 bg-primary-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8">
            <p className="text-xl font-medium text-gray-500 italic">This is to certify that</p>
            <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
              {certificate.studentName}
            </h3>
            
            <div className="py-6">
              <p className="text-xl font-medium text-gray-500 mb-4">has successfully completed the course</p>
              <h4 className="text-3xl md:text-4xl font-black text-primary-600 tracking-tight">
                {certificate.courseName}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-50 mt-12">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Date</p>
                <p className="text-lg font-bold text-gray-900">{new Date(certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Certificate ID</p>
                <p className="text-lg font-bold text-gray-900 font-mono tracking-tighter">{certificate.certificateNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grade Achieved</p>
                <p className="text-lg font-bold text-emerald-600">{certificate.grade}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-20 flex justify-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-4">
               <div className="bg-white p-2 rounded-lg shadow-sm">
                 <ShieldCheckIcon className="h-10 w-10 text-primary-600" />
               </div>
               <div className="text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Verify Authenticity</p>
                 <p className="text-xs font-bold text-gray-600">Scan QR Code or visit edulearn.com/verify</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-primary-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary-100">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <CheckBadgeIcon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900 leading-tight">Digital Credentials</h4>
            <p className="text-primary-700 text-sm font-medium">Your achievement is permanently stored on our platform.</p>
          </div>
        </div>
        <Link to="/student/dashboard" className="text-primary-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    </div>
  );
};

export default CertificateViewPage;
