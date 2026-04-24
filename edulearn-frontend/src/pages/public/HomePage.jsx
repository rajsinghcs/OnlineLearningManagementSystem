import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import CourseGrid from '../../components/course/CourseGrid';
import { RocketLaunchIcon, BookOpenIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await courseApi.getFeaturedCourses();
        setFeaturedCourses(res.data);
      } catch (err) {
        console.error('Failed to fetch featured courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { name: 'Active Students', value: '50k+', icon: UserGroupIcon },
    { name: 'Expert Courses', value: '1,200+', icon: BookOpenIcon },
    { name: 'Certified Instructors', value: '450+', icon: TrophyIcon },
    { name: 'Success Rate', value: '98%', icon: RocketLaunchIcon },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Learn Anytime.<br /><span className="text-primary-400">Grow Everywhere.</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Access world-class education from top experts. Master new skills, earn certificates, and advance your career with EduLearn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/courses" className="btn-primary py-4 px-10 text-lg rounded-full font-bold shadow-2xl hover:shadow-primary-500/20 transition-all transform hover:-translate-y-1">
              Explore Courses
            </Link>
            <Link to="/register" className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 py-4 px-10 text-lg rounded-full font-bold transition-all transform hover:-translate-y-1">
              Start Teaching
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
              <stat.icon className="h-10 w-10 text-primary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Featured Courses</h2>
            <p className="text-gray-500">Hand-picked courses by our education experts.</p>
          </div>
          <Link to="/courses" className="text-primary-600 font-bold flex items-center hover:text-primary-700">
            View All <RocketLaunchIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
        <CourseGrid courses={featuredCourses} loading={loading} />
      </section>

      {/* Categories */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Top Categories</h2>
            <p className="text-gray-400">Discover your next passion from our most popular topics.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Music'].map((cat) => (
              <Link 
                key={cat} 
                to={`/courses?category=${cat}`}
                className="bg-white/5 hover:bg-primary-600 border border-white/10 py-8 rounded-xl text-center transition-all group"
              >
                <div className="font-bold text-lg group-hover:scale-105 transition-transform">{cat}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
