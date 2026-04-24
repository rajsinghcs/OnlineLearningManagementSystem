import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <AcademicCapIcon className="h-7 w-7 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">EduLearn</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering learners worldwide with premium content and expert instructors. Start your journey today.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="/courses" className="text-sm text-gray-500 hover:text-primary-600">Browse Courses</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600">Categories</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600">Instructors</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-600">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              {/* Icons placeholders */}
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 cursor-pointer transition-colors">
                <i className="fab fa-twitter"></i>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 cursor-pointer transition-colors">
                <i className="fab fa-facebook"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EduLearn LMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
