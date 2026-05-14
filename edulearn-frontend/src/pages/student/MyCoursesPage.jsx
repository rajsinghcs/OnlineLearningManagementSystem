import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../../api/enrollmentApi';
import { courseApi } from '../../api/courseApi';
import { progressApi } from '../../api/progressApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { BookOpenIcon, CheckBadgeIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import RatingModal from '../../components/course/RatingModal';

const MyCoursesPage = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await enrollmentApi.getByStudent(user.userId);
        const rawEnrollments = res.data;

        const enrollmentsWithDetails = await Promise.all(
          rawEnrollments.map(async (enroll) => {
            try {
              const courseRes = await courseApi.getCourseById(enroll.courseId);
              return {
                ...enroll,
                courseTitle: courseRes.data.title,
                courseThumbnail: courseRes.data.thumbnailUrl
              };
            } catch (err) {
              console.error(`Failed to fetch course ${enroll.courseId}`, err);
              return enroll;
            }
          })
        );

        setEnrollments(enrollmentsWithDetails);
      } catch (err) {
        console.error('Failed to fetch enrollments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [user.userId]);

  const handleSyncProgress = async (courseId) => {
    try {
      await progressApi.syncProgress(user.userId, courseId);
      // Re-fetch enrollments to show updated progress
      const res = await enrollmentApi.getByStudent(user.userId);
      const rawEnrollments = res.data;
      const enrollmentsWithDetails = await Promise.all(
        rawEnrollments.map(async (enroll) => {
          try {
            const courseRes = await courseApi.getCourseById(enroll.courseId);
            return {
              ...enroll,
              courseTitle: courseRes.data.title,
              courseThumbnail: courseRes.data.thumbnailUrl
            };
          } catch (err) {
            return enroll;
          }
        })
      );
      setEnrollments(enrollmentsWithDetails);
      toast.success('Progress synchronized!');
    } catch (err) {
      console.error('Sync failed', err);
      toast.error('Failed to sync progress');
    }
  };

  const filteredEnrollments = filter === 'ALL'
    ? enrollments
    : enrollments.filter(e => e.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Learning</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your enrolled courses and track your progress.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEnrollments.map((enroll) => (
          <div key={enroll.enrollmentId} className="card group hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={enroll.courseThumbnail || 'https://via.placeholder.com/600x400'}
                alt={enroll.courseTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${enroll.status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-primary-500 text-white'
                  }`}>
                  {enroll.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[3.5rem] group-hover:text-primary-600 transition-colors">
                {enroll.courseTitle}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Course Progress</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleSyncProgress(enroll.courseId)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors group/sync"
                      title="Refresh Progress"
                    >
                      <ArrowPathIcon className="h-3 w-3 text-gray-400 group-hover/sync:text-primary-600 transition-colors" />
                    </button>
                    <span className="text-gray-900">{enroll.progressPercent || 0}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${enroll.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary-500'}`}
                    style={{ width: `${enroll.progressPercent || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCourseId(enroll.courseId);
                    setIsRatingModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <StarIcon className="h-4 w-4" />
                  <span>Rate</span>
                </button>
                {enroll.status === 'COMPLETED' ? (
                  <Link
                    to={`/student/certificate/${enroll.courseId}`}
                    className="flex-[2] flex items-center justify-center space-x-2 py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors"
                  >
                    <CheckBadgeIcon className="h-5 w-5" />
                    <span>Certificate</span>
                  </Link>
                ) : (
                  <Link
                    to={`/student/learn/${enroll.courseId}/${enroll.lastLessonId || 0}`}
                    className="flex-[2] flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    <span>Learn</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEnrollments.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} courses yet. Start your journey today!</p>
            <Link to="/courses" className="btn-primary py-3 px-8 rounded-xl font-bold">Browse Catalog</Link>
          </div>
        )}
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        courseId={selectedCourseId}
        studentId={user.userId}
        onRatingSubmitted={() => {
          // Could refresh to show actual rating, but rating is usually shown in cards
        }}
      />
    </div>
  );
};

export default MyCoursesPage;
