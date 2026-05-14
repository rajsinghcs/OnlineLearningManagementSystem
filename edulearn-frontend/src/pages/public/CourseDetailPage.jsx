import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import { paymentApi } from '../../api/paymentApi';
import { discnotifApi } from '../../api/discnotifApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MockPaymentModal from '../../components/payment/MockPaymentModal';
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  StarIcon, 
  ClockIcon, 
  SignalIcon, 
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { formatPrice, formatDuration, getLevelColor } from '../../utils/formatUtils';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showMockPayment, setShowMockPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseApi.getCourseById(courseId),
          courseApi.getLessonsByCourse(courseId)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);

        if (isAuthenticated && user?.userId) {
          try {
            const [enrollmentRes, subRes] = await Promise.all([
              enrollmentApi.isEnrolled(user.userId, courseId).catch(() => ({ data: false })),
              paymentApi.isSubscriptionActive(user.userId).catch(() => ({ data: false }))
            ]);
            setIsEnrolled(enrollmentRes.data || subRes.data);
          } catch (e) {
            console.error("Error checking enrollment status", e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course details', err);
        toast.error('Could not load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, isAuthenticated, user?.userId]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!course) return <div className="text-center py-20">Course not found.</div>;

  const handlePaymentSuccess = async (response) => {
    try {
      const paymentData = {
        studentId: user.userId,
        courseId: courseId,
        amount: course.price,
        status: "SUCCESS",
        mode: "RAZORPAY",
        transactionId: response.razorpay_payment_id || `txn_${Date.now()}`
      };
      await paymentApi.processPayment(paymentData);

      const enrollmentData = {
        studentId: user.userId,
        courseId: courseId,
        courseName: course.title,
        status: "ACTIVE"
      };
      await enrollmentApi.enroll(enrollmentData);

      toast.success("Payment successful! You are now enrolled.");
      navigate('/student/dashboard');
    } catch (error) {
      console.error("Error finalizing enrollment:", error);
      toast.error("Payment received, but enrollment failed. Please contact support.");
    }
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
      return;
    }

    if (!course.price || course.price <= 0) {
      handleFreeEnrollment();
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay script not loaded. Falling back to mock payment.");
      setShowMockPayment(true);
      return;
    }
    
    const options = {
      key: "rzp_test_Sip4hhQ75N6HrV",
      amount: course.price * 100, // Razorpay works in paise/cents
      currency: "INR",
      name: "EduLearn LMS",
      description: `Enrollment for ${course.title}`,
      image: "https://via.placeholder.com/150",
      handler: handlePaymentSuccess,
      prefill: {
        name: user.fullName || "Student",
        email: user.email || "student@example.com",
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

  const handleFreeEnrollment = async () => {
    try {
      const enrollmentData = {
        studentId: user.userId,
        courseId: courseId,
        status: "ACTIVE"
      };
      await enrollmentApi.enroll(enrollmentData);

      try {
        await discnotifApi.sendNotification({
          userId: user.userId,
          type: "ENROLLMENT",
          title: "Course Enrollment Successful",
          message: `You have successfully enrolled in ${course.title}. Happy learning!`,
          relatedEntityId: parseInt(courseId),
          relatedEntityType: "COURSE"
        });
      } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
      }

      toast.success("Successfully enrolled in free course!");
      navigate('/student/dashboard');
    } catch (error) {
      console.error("Error enrolling in free course:", error);
      toast.error("Failed to enroll. Please try again later.");
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 space-y-6">
            <nav className="flex text-sm text-gray-400 space-x-2">
              <Link to="/courses" className="hover:text-white">Courses</Link>
              <span>/</span>
              <span className="text-primary-400">{course.category}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{course.title}</h1>
            <p className="text-xl text-gray-300 font-light max-w-2xl">{course.description}</p>
            <div className="flex flex-wrap gap-6 items-center pt-4">
              <div className="flex items-center space-x-2">
                <CheckBadgeIcon className="h-5 w-5 text-secondary-500" />
                <span className="text-sm font-medium">Verified Instructor: <span className="text-primary-400">{course.instructorName}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIconSolid className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-bold">{course.averageRating || '0.0'} ({course.totalRatings || 0} reviews)</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="card bg-white text-gray-900 shadow-2xl overflow-hidden transform lg:translate-y-24">
              <img 
                src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                alt={course.title} 
                className="w-full aspect-video object-cover"
              />
              <div className="p-8 space-y-6">
                <div className="text-4xl font-black">{formatPrice(course.price)}</div>
                
                {user?.role === 'ADMIN' ? (
                  <div className="bg-primary-50 border border-primary-100 text-primary-700 p-4 rounded-xl text-center font-bold text-sm">
                    Viewing as Administrator
                  </div>
                ) : user?.role === 'INSTRUCTOR' ? (
                  <div className="bg-secondary-50 border border-secondary-100 text-secondary-700 p-4 rounded-xl text-center font-bold text-sm">
                    Viewing as Instructor
                  </div>
                ) : isEnrolled ? (
                  <Link to={`/student/learn/${courseId}/${lessons[0]?.lessonId}`} className="btn-primary w-full py-4 text-center block text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30">
                    Continue Learning
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button onClick={handleEnrollClick} className="btn-primary w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30">
                      Add Course
                    </button>
                  </div>
                )}

                <div className="space-y-3 text-sm text-gray-600 font-medium">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"><ClockIcon className="h-5 w-5 mr-3 text-gray-400" /> Duration</div>
                    <span>{formatDuration(course.totalDuration || 450)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"><BookOpenIcon className="h-5 w-5 mr-3 text-gray-400" /> Lessons</div>
                    <span>{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"><SignalIcon className="h-5 w-5 mr-3 text-gray-400" /> Level</div>
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MockPaymentModal
        isOpen={showMockPayment}
        onClose={() => setShowMockPayment(false)}
        course={course}
        onSuccess={handlePaymentSuccess}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-20 lg:mt-32 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Learning Objectives */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">What you'll learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckBadgeIcon className="h-5 w-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm leading-relaxed">Master the core concepts and advanced techniques of {course.category.toLowerCase()} in real-world scenarios.</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Course Curriculum</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 0 ? null : 0)}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-900">Module 1: Introduction & Fundamentals</span>
                    <span className="text-xs text-gray-500 font-medium">{lessons.length} lessons • 45m</span>
                  </div>
                  {expandedSection === 0 ? <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
                </button>
                
                {expandedSection === 0 && (
                  <div className="divide-y divide-gray-100 bg-white">
                    {lessons.map((lesson, idx) => (
                      <div key={lesson.lessonId} className="p-5 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <PlayCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
                          <div>
                            <div className="text-sm font-bold text-gray-800">{idx + 1}. {lesson.title}</div>
                            <div className="text-xs text-gray-500">{lesson.durationMinutes} min</div>
                          </div>
                        </div>
                        {lesson.isPreview && !isEnrolled && (
                          <Link to={`/student/learn/${courseId}/${lesson.lessonId}`} className="text-xs font-bold text-primary-600 border border-primary-100 px-3 py-1 rounded-full hover:bg-primary-600 hover:text-white transition-all uppercase tracking-wider">Preview</Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
