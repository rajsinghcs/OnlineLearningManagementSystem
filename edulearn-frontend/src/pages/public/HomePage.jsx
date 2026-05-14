import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import CourseGrid from '../../components/course/CourseGrid';
import { 
  UsersIcon, 
  BookOpenIcon, 
  StarIcon, 
  AcademicCapIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

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

  return (
    <div className="sparkle-bg min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#3b82f6]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Next Generation Learning</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 italic uppercase">
            Empower Your <br />
            <span className="bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#93c5fd] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              Digital Brain _
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-400 font-medium leading-relaxed mb-16 tracking-tight">
            Master the most in-demand skills with our state-of-the-art AI-powered platform. Designed for the futuristic student.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/courses" className="btn-cyber py-5 px-16 text-sm">
              Explore Modules
            </Link>
            <Link to="/register" className="btn-ghost py-5 px-16 text-sm">
              Initiate Access
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Nodes', value: '10K+', icon: UsersIcon },
            { label: 'Course Modules', value: '500+', icon: BookOpenIcon },
            { label: 'Elite Mentors', value: '200+', icon: StarIcon },
            { label: 'Success Rate', value: '98%', icon: AcademicCapIcon },
          ].map((stat) => (
            <div key={stat.label} className="glass-card text-center group">
              <div className="w-16 h-16 bg-[#3b82f6]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <stat.icon className="h-8 w-8 text-[#3b82f6]" />
              </div>
              <div className="text-4xl font-black mb-2 italic tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Featured <span className="text-[#3b82f6]">Operations</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-xs">High-Intensity Learning Modules</p>
          </div>
          <Link to="/courses" className="text-[#3b82f6] font-black uppercase tracking-widest text-[10px] hover:underline italic">View All Modules</Link>
        </div>
        
        <CourseGrid courses={featuredCourses} loading={loading} />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-32">
        <div className="glass-card relative overflow-hidden group p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">
              Ready to <span className="text-[#3b82f6]">Upgrade</span> Your Future?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg mb-12">
              Join 10,000+ students mastering the digital frontier today.
            </p>
            <Link to="/register" className="btn-cyber py-5 px-20 text-sm">
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
