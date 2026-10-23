// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "@/lib/router";
import api from "@/lib/axios";
import { setUser } from "@/lib/redux/authSlice"; 
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import Logo from "@/components/brand/Logo";

const AdminNavbar = ({ toggleSidebar }: any) => {
  const { user } = useSelector((store: any) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.get(`${endpoints.user}/logout`, { withCredentials: true });
      dispatch(setUser(null)); 
      navigate("/login"); 
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-gray-600 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>
      <div className="flex items-center gap-3">
        <span className="lg:hidden">
          <Logo href="/admin/dashboard" size="sm" />
        </span>
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center focus:outline-none"
        >
          <img
            src={user?.profile?.profilePhoto}
            alt="User Avatar"
            className="w-12 h-12 rounded-full border border-gray-300 bg-cover"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
            <Link
              to="/admin/profile"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
