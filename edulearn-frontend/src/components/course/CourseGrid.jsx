import React from 'react';
import CourseCard from './CourseCard';

const CourseGrid = ({ courses, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card h-96 animate-pulse bg-gray-50"></div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">No courses found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  );
};

export default CourseGrid;
