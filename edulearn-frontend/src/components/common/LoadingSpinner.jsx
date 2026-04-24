import React from 'react';

const LoadingSpinner = ({ fullPage }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-l-4 border-r-4 border-primary-200 animate-pulse"></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Loading EduLearn...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[300px]">
      {content}
    </div>
  );
};

export default LoadingSpinner;
