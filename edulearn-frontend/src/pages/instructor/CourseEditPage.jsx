import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { courseSchema } from '../../utils/validationSchemas';
import { courseApi } from '../../api/courseApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const CourseEditPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(courseSchema)
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getCourseById(courseId);
        const course = res.data;
        
        // Populate form fields
        Object.keys(course).forEach(key => {
          setValue(key, course[key]);
        });
      } catch (err) {
        toast.error('Failed to load course data');
        navigate('/instructor/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, setValue, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await courseApi.updateCourse(courseId, data);
      toast.success('Course updated successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Course</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
              <input 
                {...register('title')}
                className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-primary-500 focus:border-primary-500`}
                placeholder="e.g. Complete React Mastery 2025"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600 font-medium">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                {...register('description')}
                rows="5"
                className={`w-full px-4 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Tell your students what they will learn..."
              ></textarea>
              {errors.description && <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Category</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Music">Music</option>
                  <option value="Health">Health</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-600 font-medium">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty Level</label>
                <select 
                  {...register('level')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Pricing & Media</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
              <input 
                {...register('price')}
                type="number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                placeholder="0 for free"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600 font-medium">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
              <input 
                {...register('language')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. English"
              />
              {errors.language && <p className="mt-1 text-xs text-red-600 font-medium">{errors.language.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail URL</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-primary-400 transition-colors cursor-pointer group">
              <div className="space-y-1 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    Paste Image URL here
                  </span>
                </div>
                <input 
                  {...register('thumbnailUrl')}
                  className="w-full mt-2 px-3 py-1 text-xs border border-gray-200 rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary px-10 py-3 rounded-xl font-bold disabled:opacity-50 shadow-xl shadow-primary-200">
            {submitting ? 'Saving...' : 'Update Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditPage;
