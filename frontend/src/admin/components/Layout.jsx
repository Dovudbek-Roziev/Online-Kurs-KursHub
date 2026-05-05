import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SiteHeader from '../../components/layout/SiteHeader';
import { FiMenu } from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-300">
      <SiteHeader />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 p-4 md:p-6 lg:p-8 relative min-h-[calc(100vh-4rem)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-5 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--text-main)] text-[var(--bg)] shadow-lg"
          >
            <FiMenu size={20} />
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
