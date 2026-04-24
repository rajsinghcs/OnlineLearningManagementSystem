import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import CourseGrid from '../../components/course/CourseGrid';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CourseCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('keyword') || '');

  const category = searchParams.get('category');
  const level = searchParams.get('level');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let res;
        if (search) {
          res = await courseApi.searchCourses(search);
        } else if (category) {
          res = await courseApi.getCoursesByCategory(category);
        } else if (level) {
          res = await courseApi.getCoursesByLevel(level);
        } else {
          res = await courseApi.getAllCourses();
        }
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [category, level, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword: search });
  };

  const categories = ['Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Music', 'Health'];
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-primary-600" /> Filters
            </h3>
            
            <form onSubmit={handleSearch} className="relative mb-8">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </form>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSearchParams({})}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${!category ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSearchParams({ category: cat })}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${category === cat ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Difficulty</h4>
                <div className="space-y-2">
                  {levels.map(l => (
                    <button 
                      key={l}
                      onClick={() => setSearchParams({ level: l })}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${level === l ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {l.charAt(0) + l.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {category ? `${category} Courses` : 'All Courses'}
            </h2>
            <p className="text-gray-500 mt-2">
              Showing {courses.length} courses {search ? `for "${search}"` : ''}
            </p>
          </div>

          <CourseGrid courses={courses} loading={loading} />
        </main>
      </div>
    </div>
  );
};

export default CourseCatalogPage;
