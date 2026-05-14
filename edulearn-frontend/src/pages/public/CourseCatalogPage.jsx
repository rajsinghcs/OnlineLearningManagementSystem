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
    <div className="bg-dark-bg min-h-screen text-white pb-32">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-96 space-y-12">
            <div className="glass-card sticky top-32">
              <h3 className="text-2xl font-black text-white mb-10 flex items-center uppercase italic tracking-tighter">
                <FunnelIcon className="h-6 w-6 mr-4 text-[#3b82f6]" /> Filters <span className="text-[#3b82f6] ml-2">_</span>
              </h3>
              
              <form onSubmit={handleSearch} className="relative mb-12">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH_DATA..."
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-5 top-5" />
              </form>

              <div className="space-y-10">
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 mb-6 uppercase tracking-[0.3em]">Operational Modules</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setSearchParams({})}
                      className={`block w-full text-left text-[10px] font-black py-4 px-6 rounded-[1.2rem] transition-all uppercase tracking-widest italic ${!category ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                    >
                      All Clusters
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSearchParams({ category: cat })}
                        className={`block w-full text-left text-[10px] font-black py-4 px-6 rounded-[1.2rem] transition-all uppercase tracking-widest italic ${category === cat ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-10">
                  <h4 className="text-[10px] font-black text-gray-500 mb-6 uppercase tracking-[0.3em]">Complexity Level</h4>
                  <div className="space-y-3">
                    {levels.map(l => (
                      <button 
                        key={l}
                        onClick={() => setSearchParams({ level: l })}
                        className={`block w-full text-left text-[10px] font-black py-4 px-6 rounded-[1.2rem] transition-all uppercase tracking-widest italic ${level === l ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            <div className="mb-16">
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">
                {category ? category : 'CENTRAL_HUB'} <span className="text-[#3b82f6]">_</span>
              </h2>
              <p className="text-gray-500 mt-6 text-sm font-black uppercase tracking-[0.2em] italic">
                Available Nodes: {courses.length} {search ? `| SYNC_QUERY: "${search}"` : ''}
              </p>
            </div>

            <CourseGrid courses={courses} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalogPage;
