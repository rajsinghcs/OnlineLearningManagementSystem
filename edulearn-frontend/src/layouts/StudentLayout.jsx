import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const StudentLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg sparkle-bg">
      <Navbar />
      <div className="flex flex-grow relative z-10">
        <Sidebar type="STUDENT" />
        <main className="flex-grow p-4 md:p-12 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
