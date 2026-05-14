import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatUtils';
import { StarIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const CourseCard = ({ course }) => {
  return (
    <div className="glass-card group p-0 overflow-hidden hover:border-[#3b82f6]/50 transition-all duration-700 flex flex-col relative border border-white/5 rounded-[2.5rem]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link to={`/courses/${course.courseId}`}>
          <img 
            src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
            alt={course.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          />
        </Link>
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-xl border border-white/20 bg-black/40 text-white">
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-8 flex-grow flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.3em]">
            {course.category}
          </span>
          <div className="flex items-center text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <StarIcon className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-black italic">{course.averageRating || '0.0'}</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-4 line-clamp-2 leading-[1.1] uppercase italic tracking-tighter group-hover:text-[#3b82f6] transition-colors">
          <Link to={`/courses/${course.courseId}`}>{course.title}</Link>
        </h3>
        
        <div className="mt-auto pt-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">OPERATIVE: {course.instructorName?.split(' ')[0] || 'ELITE'}</span>
            </div>
            <span className="text-2xl font-black text-white italic tracking-tighter">
              {formatPrice(course.price)}
            </span>
          </div>
          <Link 
            to={`/courses/${course.courseId}`} 
            className="btn-cyber w-full py-5 text-center block text-[11px]"
          >
            Initiate Module
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
