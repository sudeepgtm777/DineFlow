// @ts-nocheck
import React from "react";
import { NavLink } from "@/lib/router";

const Sidebar = (_props: any) => {
  return (
    <div className="h-full w-64 bg-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Restaurant ERP</h1>

      <ul className="space-y-4">
        {/* Dashboard */}
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-tachometer-alt text-xl"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Orders Management */}
        <li>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-boxes text-xl"></i>
            <span>Manage Orders</span>
          </NavLink>
        </li>

        {/* Menu Management */}
        <li>
          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-utensils text-xl"></i>
            <span>Menu Management</span>
          </NavLink>
        </li>


        {/* Staff Management */}
        {/* <li>
          <NavLink
            to="/admin/staff"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-users text-xl"></i>
            <span>Staff</span>
          </NavLink>
        </li> */}



        {/* Tables */}
        <li>
          <NavLink
            to="/admin/table-stats"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-chart-line text-xl"></i>
            <span>Tables Manager</span>
          </NavLink>
        </li>


        {/* Rooms */}
        <li>
          <NavLink
            to="/admin/room-stats"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-chart-line text-xl"></i>
            <span>Room Manager</span>
          </NavLink>
        </li>

         {/* Pos */}
        <li>
          <NavLink
            to="/admin/pos"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-chart-line text-xl"></i>
            <span>Pos</span>
          </NavLink>
        </li>

         {/* Reports */}
        <li>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-chart-line text-xl"></i>
            <span>Reports</span>
          </NavLink>
        </li>


           {/* Reports */}
        <li>
          <NavLink
            to="/admin/get-total"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-chart-line text-xl"></i>
            <span>Get Total</span>
          </NavLink>
        </li>

       

        {/* Settings */}
        <li>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive
                ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
                : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all"
            }
          >
            <i className="fas fa-cogs text-xl"></i>
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
