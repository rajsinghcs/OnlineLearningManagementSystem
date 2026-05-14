import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { lessonSchema } from '../../utils/validationSchemas';
import { courseApi } from '../../api/courseApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  Bars3Icon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const LessonManagePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(lessonSchema),
    defaultValues: {
      contentType: 'VIDEO',
      durationMinutes: 10
    }
  });

  const contentType = useWatch({ control, name: 'contentType' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseApi.getCourseById(courseId),
          courseApi.getLessonsByCourse(courseId)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const onAddLesson = async (data) => {
    setSubmitting(true);
    try {
      let contentUrl = data.contentUrl;
      
      // If user pasted an iframe (common mistake), extract the src URL
      if (contentUrl.includes('<iframe') && contentUrl.includes('src=')) {
        const match = contentUrl.match(/src="([^"]+)"/);
        if (match && match[1]) {
          contentUrl = match[1];
        }
      }

      const lessonData = { 
        ...data, 
        contentUrl: contentUrl.trim(),
        courseId: parseInt(courseId), 
        orderNum: lessons.length + 1 
      };
      const res = await courseApi.addLesson(lessonData);
      setLessons([...lessons, res.data]);
      setIsAdding(false);
      reset();
      toast.success('Lesson added successfully!');
    } catch (err) {
      toast.error('Failed to add lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await courseApi.deleteLesson(id);
      setLessons(lessons.filter(l => l.lessonId !== id));
      toast.success('Lesson deleted');
    } catch (err) {
      toast.error('Failed to delete lesson');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Curriculum</h1>
            <p className="text-gray-500 font-medium">Course: {course?.title}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-3 px-6 flex items-center rounded-xl shadow-lg shadow-primary-200"
        >
          {isAdding ? 'Close Form' : <><PlusIcon className="h-5 w-5 mr-2" /> Add New Lesson</>}
        </button>
      </div>

      {isAdding && (
        <div className="card p-8 border-2 border-primary-100 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Lesson Details</h2>
          <form onSubmit={handleSubmit(onAddLesson)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 mb-1">Lesson Title</label>
              <input 
                {...register('title')}
                className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-primary-500 focus:border-primary-500`}
                placeholder="e.g. Setting up the Development Environment"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600 font-medium">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Content Type</label>
              <select 
                {...register('contentType')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Article</option>
                <option value="PDF">PDF Document</option>
              </select>
            </div>

            {contentType === 'VIDEO' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration (minutes)</label>
                <input 
                  {...register('durationMinutes')}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {contentType === 'PDF' ? (
              <div className="col-span-full">
                <label className="block text-sm font-bold text-gray-700 mb-1">Upload PDF Document</label>
                <input 
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setValue('contentUrl', URL.createObjectURL(file));
                      toast.success('PDF selected successfully');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
                />
                <input type="hidden" {...register('contentUrl')} />
                {errors.contentUrl && <p className="mt-1 text-xs text-red-600 font-medium">{errors.contentUrl.message}</p>}
                <p className="mt-2 text-xs text-gray-500">Note: In a real application, this would upload to a cloud storage bucket. For now, it will generate a local preview URL.</p>
              </div>
            ) : (
              <div className="col-span-full">
                <label className="block text-sm font-bold text-gray-700 mb-1">Content URL / Video URL</label>
                <input 
                  {...register('contentUrl')}
                  className={`w-full px-4 py-3 border ${errors.contentUrl ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                />
                <p className="mt-1 text-[10px] text-gray-400 font-medium">Paste the direct link. If you paste an embed code, we'll try to extract the link for you.</p>
                {errors.contentUrl && <p className="mt-1 text-xs text-red-600 font-medium">{errors.contentUrl.message}</p>}
              </div>
            )}

            <div className="col-span-full flex justify-end space-x-4 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary py-2 px-8 text-sm font-bold rounded-xl shadow-lg shadow-primary-200">
                {submitting ? 'Saving...' : 'Add Lesson'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {lessons.sort((a, b) => a.orderNum - b.orderNum).map((lesson, index) => (
          <div key={lesson.lessonId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center group hover:border-primary-200 transition-all">
            <div className="flex items-center space-x-4 flex-grow">
              <div className="p-2 text-gray-300 group-hover:text-gray-400 cursor-move">
                <Bars3Icon className="h-5 w-5" />
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400">
                {index + 1}
              </div>
              <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-primary-50 transition-colors">
                {lesson.contentType === 'VIDEO' ? <PlayCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" /> : <DocumentTextIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{lesson.title}</h4>
                <div className="flex items-center mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {lesson.contentType} • {lesson.durationMinutes} MIN
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                <PencilIcon className="h-5 w-5" />
              </button>
              <button onClick={() => deleteLesson(lesson.lessonId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {lessons.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No lessons yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start building your curriculum by adding your first lesson.</p>
            <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-6 rounded-xl font-bold">Add First Lesson</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonManagePage;
