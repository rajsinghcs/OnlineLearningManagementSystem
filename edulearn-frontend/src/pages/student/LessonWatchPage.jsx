import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { courseApi } from '../../api/courseApi';
import { progressApi } from '../../api/progressApi';
import { assessmentApi } from '../../api/assessmentApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  PlayCircleIcon
} from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AiTutorChat from '../../components/course/AiTutorChat';

const LessonWatchPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('RESOURCES'); // RESOURCES, QUIZZES
  const [videoError, setVideoError] = useState(false);

  const playerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, progressRes, quizzesRes] = await Promise.all([
          courseApi.getCourseById(courseId),
          courseApi.getLessonsByCourse(courseId),
          progressApi.getCourseProgress(user.userId, courseId).catch(() => ({ data: { completedLessonIds: [] } })),
          assessmentApi.getQuizzesByCourse(courseId).catch(() => ({ data: [] }))
        ]);
        
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        setCompletedLessons(progressRes.data.completedLessonIds || []);
        setQuizzes(quizzesRes.data.filter(q => q.isPublished) || []);

        const lessonToWatch = lessonId !== '0' 
          ? lessonsRes.data.find(l => l.lessonId.toString() === lessonId)
          : lessonsRes.data[0];
        
        if (lessonToWatch) {
          setCurrentLesson(lessonToWatch);
          const resourcesRes = await courseApi.getResources(lessonToWatch.lessonId);
          setResources(resourcesRes.data);
        }
      } catch (err) {
        console.error('Failed to load lesson data', err);
        toast.error('Could not load lesson content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId, user.userId]);

  const handleProgress = (state) => {
    // Only track if it's a video
    if (currentLesson?.contentType === 'VIDEO' && state.playedSeconds % 30 < 1) {
      progressApi.trackProgress({
        userId: user.userId,
        courseId,
        lessonId: currentLesson.lessonId,
        progressSeconds: Math.floor(state.playedSeconds)
      });
    }
  };

  const markComplete = async () => {
    try {
      await progressApi.markLessonComplete({
        userId: user.userId,
        courseId,
        lessonId: currentLesson.lessonId
      });
      setCompletedLessons([...completedLessons, currentLesson.lessonId]);
      toast.success('Lesson marked as complete!');
      
      // Auto-navigate to next lesson
      const currentIndex = lessons.findIndex(l => l.lessonId === currentLesson.lessonId);
      if (currentIndex < lessons.length - 1) {
        const next = lessons[currentIndex + 1];
        navigate(`/student/learn/${courseId}/${next.lessonId}`);
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!currentLesson) return <div className="p-20 text-center">Lesson not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Sidebar - Lesson List */}
      <aside className={`${sidebarOpen ? 'w-full lg:w-80' : 'w-0'} bg-gray-50 border-r border-gray-100 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-black text-gray-900 tracking-tight leading-tight">{course.title}</h2>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>{completedLessons.length}/{lessons.length} LESSONS</span>
            <span>{Math.round((completedLessons.length / lessons.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-secondary-500" style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {lessons.map((lesson, idx) => (
            <Link 
              key={lesson.lessonId}
              to={`/student/learn/${courseId}/${lesson.lessonId}`}
              className={`p-4 flex items-start space-x-3 hover:bg-white transition-colors border-l-4 ${
                currentLesson.lessonId === lesson.lessonId 
                ? 'bg-white border-primary-600' 
                : 'border-transparent'
              }`}
            >
              <div className="mt-0.5">
                {completedLessons.includes(lesson.lessonId) 
                  ? <CheckCircleIcon className="h-5 w-5 text-secondary-500" />
                  : <CheckCircleOutline className="h-5 w-5 text-gray-300" />
                }
              </div>
              <div className="flex-grow">
                <div className={`text-sm font-bold leading-snug ${currentLesson.lessonId === lesson.lessonId ? 'text-primary-600' : 'text-gray-700'}`}>
                  {idx + 1}. {lesson.title}
                </div>
                <div className="flex items-center mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {lesson.contentType === 'VIDEO' ? <PlayIcon className="h-3 w-3 mr-1" /> : <DocumentTextIcon className="h-3 w-3 mr-1" />}
                  {lesson.durationMinutes} min
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content - Video Player & Details */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 p-1 rounded-r-lg shadow-md z-10 hover:text-primary-600 transition-colors hidden lg:block"
        >
          {sidebarOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </button>

        <div className="flex-grow overflow-y-auto custom-scrollbar bg-gray-50">
          {/* Player Container */}
          <div className="w-full aspect-video bg-black shadow-2xl relative">
            {(() => {
              const url = currentLesson.contentUrl || currentLesson.content_url;
              if (!url) return <div className="p-20 text-center text-white">No content URL provided.</div>;

              const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
              const isVideo = currentLesson.contentType === 'VIDEO' || isYouTube;

              if (!isVideo) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4 p-10 text-center">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                    <h3 className="text-2xl font-bold">Document Content</h3>
                    <p className="max-w-md text-gray-400">This lesson contains document content. Please read the materials below and mark the lesson as complete.</p>
                    <a href={url} target="_blank" rel="noreferrer" className="btn-primary px-8 py-3 rounded-full">Open Document</a>
                  </div>
                );
              }

              // Handle YouTube separately for maximum reliability
              if (isYouTube) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                const videoId = (match && match[2].length === 11) ? match[2] : null;

                if (videoId) {
                  return (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&origin=${window.location.origin}`}
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  );
                }
              }

              // Fallback to ReactPlayer for other video types
              return (
                <ReactPlayer 
                  ref={playerRef}
                  url={url}
                  width="100%"
                  height="100%"
                  controls
                  onProgress={handleProgress}
                  onError={() => setVideoError(true)}
                  onReady={() => setVideoError(false)}
                />
              );
            })()}
          </div>

          <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-black text-primary-600 uppercase tracking-widest">{currentLesson.contentType}</span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{currentLesson.title}</h2>
              </div>
              {!completedLessons.includes(currentLesson.lessonId) && (
                <button 
                  onClick={markComplete}
                  className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-secondary-200 transition-all transform hover:-translate-y-1"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">About this lesson</h3>
                <p className="text-gray-600 leading-relaxed">
                  In this lesson, we dive deep into the core concepts of {currentLesson.title}. 
                  Make sure to download the resources provided and follow along with the exercises.
                </p>
                
                <div className="flex items-center space-x-6 pt-4">
                  <Link to={`/student/forum/${courseId}`} className="flex items-center space-x-2 text-sm font-bold text-primary-600 hover:text-primary-700">
                    <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                    <span>Discuss this lesson</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex border-b border-gray-100 mb-4">
                  <button 
                    onClick={() => setActiveTab('RESOURCES')}
                    className={`pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 mr-6 ${
                      activeTab === 'RESOURCES' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Resources
                  </button>
                  <button 
                    onClick={() => setActiveTab('QUIZZES')}
                    className={`pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === 'QUIZZES' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Quizzes
                  </button>
                </div>

                {activeTab === 'RESOURCES' ? (
                  <div className="space-y-3">
                    {resources.map(res => (
                      <a 
                        key={res.resourceId}
                        href={res.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{res.fileName}</span>
                        </div>
                        <ArrowDownTrayIcon className="h-4 w-4 text-gray-300 group-hover:text-primary-600" />
                      </a>
                    ))}
                    {resources.length === 0 && <p className="text-xs text-gray-400 italic">No resources available.</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map(quiz => (
                      <Link 
                        key={quiz.quizId}
                        to={`/student/quiz/${quiz.quizId}`}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <AcademicCapIcon className="h-5 w-5 text-gray-400 group-hover:text-secondary-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-700">{quiz.title}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              {quiz.timeLimitMinutes} MINS • {quiz.maxAttempts} ATTEMPTS
                            </div>
                          </div>
                        </div>
                        <PlayIcon className="h-4 w-4 text-gray-300 group-hover:text-secondary-500" />
                      </Link>
                    ))}
                    {quizzes.length === 0 && <p className="text-xs text-gray-400 italic">No quizzes available for this course.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <AiTutorChat lesson={currentLesson} course={course} resources={resources} />
      </main>
    </div>
  );
};

export default LessonWatchPage;
