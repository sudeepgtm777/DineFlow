import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import Sidebar from './Sidebar';
import { useNavigate } from '@/lib/router';
import { useAppSelector } from '@/lib/redux/hooks';
import useSyncAuth from '@/hooks/useSyncAuth';

const AdminLayout = ({ children }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAppSelector((store) => store.auth);
  const navigate = useNavigate();

  useSyncAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <AdminNavbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
