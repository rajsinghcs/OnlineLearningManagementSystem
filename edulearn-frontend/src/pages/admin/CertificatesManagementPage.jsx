import React, { useEffect, useState } from 'react';
import { courseApi } from '../../api/courseApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import { authApi } from '../../api/authApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrophyIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { certificateApi } from '../../api/certificateApi';
import toast from 'react-hot-toast';

const CertificatesManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        courseApi.getAllCoursesAdmin(),
        authApi.getAllUsers()
      ]);

      const courses = coursesRes.data || [];
      const users = usersRes.data || [];

      // Fetch enrollments per course
      const enrollmentsNested = await Promise.all(
        courses.map(async (c) => {
          try {
            const res = await enrollmentApi.getByCourse(c.courseId);
            return res.data.map(e => ({
              ...e,
              courseTitle: c.title,
              studentName: users.find(u => u.userId === e.studentId)?.fullName || `Student #${e.studentId}`
            }));
          } catch (err) {
            return [];
          }
        })
      );

      const realEnrollments = enrollmentsNested.flat();

      // Enrich with certificate status
      const enrichedEnrollments = await Promise.all(
        realEnrollments.map(async (e) => {
          try {
            const certsRes = await certificateApi.getByStudent(e.studentId);
            const cert = certsRes.data.find(c => c.courseName === e.courseTitle);
            return {
              ...e,
              certStatus: cert?.status || 'NONE',
              certNo: cert?.certificateNumber
            };
          } catch (err) {
            return { ...e, certStatus: 'NONE' };
          }
        })
      );

      setCertificates(enrichedEnrollments);
    } catch (error) {
      console.error('Failed to fetch certificates', error);
      toast.error('Error connecting to enrollment gateways.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (certNo) => {
    console.log('Attempting to approve certificate:', certNo);
    try {
      setLoading(true);
      const res = await certificateApi.approve(certNo);
      console.log('Approval response:', res.data);
      toast.success('Certificate approved and issued successfully!');
      fetchData();
    } catch (err) {
      console.error('Certificate approval failed full error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || `Failed to approve certificate (${err.response?.status || 'Unknown error'})`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueDirect = async (e) => {
    try {
      setLoading(true);
      await certificateApi.issue({
        studentId: e.studentId.toString(),
        studentName: e.studentName,
        studentEmail: 'student@example.com', // Would need real email
        courseName: e.courseTitle,
        grade: 'A+'
      });
      toast.success('Certificate issued directly!');
      fetchData();
    } catch (err) {
      toast.error('Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
          <TrophyIcon className="h-8 w-8 text-primary-600" />
          <span>Certificates & Credentials</span>
        </h1>
        <p className="text-gray-500 font-medium mt-2">Review, confirm, and unlock qualification awards platform-wide.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Completion Rate</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
            {certificates.map((cert) => (
              <tr key={cert.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{cert.studentName}</td>
                <td className="px-6 py-4">{cert.courseTitle}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{cert.progressPercent || 0}%</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500" 
                        style={{ width: `${cert.progressPercent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {cert.certStatus === 'ISSUED' ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <ShieldCheckIcon className="h-4 w-4 mr-1" /> Issued
                    </span>
                  ) : cert.certStatus === 'REQUESTED' ? (
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                      Requested
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      No Request
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {cert.certStatus === 'REQUESTED' ? (
                    <button 
                      onClick={() => handleApprove(cert.certNo)}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-primary-200 transition-all"
                    >
                      Approve & Issue
                    </button>
                  ) : cert.certStatus === 'NONE' && cert.progressPercent === 100 ? (
                    <button 
                      onClick={() => handleIssueDirect(cert)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Issue Direct
                    </button>
                  ) : cert.certStatus === 'ISSUED' ? (
                    <span className="text-xs text-gray-400 italic">Issued</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Awaiting Progress</span>
                  )}
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                  No matching learners are awaiting verification.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificatesManagementPage;
