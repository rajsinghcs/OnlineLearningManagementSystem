import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getLevelColor } from '../../utils/formatUtils';

const CourseCard = ({ course }) => {
  return (
    <div className="card group hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <span className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wide">
          {course.category}
        </span>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
          <Link to={`/courses/${course.courseId}`}>{course.title}</Link>
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gray-200"></div>
            <span className="text-xs text-gray-600 font-medium">{course.instructorName || 'Expert Instructor'}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
