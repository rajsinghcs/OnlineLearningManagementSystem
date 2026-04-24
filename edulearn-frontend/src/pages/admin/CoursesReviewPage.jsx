import React, { useEffect, useState } from 'react';
import { courseApi } from '../../api/courseApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatUtils';

const CoursesReviewPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAllCoursesAdmin();
        setCourses(res.data);
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleApprove = async (id) => {
    try {
      await courseApi.approveCourse(id);
      setCourses(courses.map(c => c.courseId === id ? { ...c, status: 'PUBLISHED' } : u));
      toast.success('Course approved and published');
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this course?')) return;
    try {
      await courseApi.rejectCourse(id);
      setCourses(courses.map(c => c.courseId === id ? { ...c, status: 'REJECTED' } : u));
      toast.success('Course rejected');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filteredCourses = filter === 'ALL' ? courses : courses.filter(c => c.status === (filter === 'PENDING' ? 'PENDING' : 'PUBLISHED' || c.status === 'REJECTED'));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Course Moderation</h1>
          <p className="text-gray-500 mt-2 font-medium">Review and approve new course submissions.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {['PENDING', 'PUBLISHED', 'REJECTED', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4">Course Info</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredCourses.map((course) => (
                <React.Fragment key={course.courseId}>
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img src={course.thumbnailUrl || 'https://via.placeholder.com/100'} className="h-10 w-16 rounded-lg object-cover" />
                        <div className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{course.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">{course.instructorName}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{course.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{formatPrice(course.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        course.status === 'PUBLISHED' ? 'text-green-600 bg-green-50' : 
                        course.status === 'REJECTED' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setExpandedRow(expandedRow === course.courseId ? null : course.courseId)}
                          className="p-2 text-gray-400 hover:text-primary-600 rounded-lg"
                        >
                          {expandedRow === course.courseId ? <ChevronUpIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                        {course.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(course.courseId)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleReject(course.courseId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === course.courseId && (
                    <tr>
                      <td colSpan="6" className="bg-gray-50 px-6 py-8 animate-in slide-in-from-top-2">
                        <div className="max-w-3xl">
                          <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest">Course Description</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Level</div>
                              <div className="text-sm font-bold text-gray-800">{course.level}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Language</div>
                              <div className="text-sm font-bold text-gray-800">{course.language}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredCourses.length === 0 && (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 text-sm italic">No courses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoursesReviewPage;
