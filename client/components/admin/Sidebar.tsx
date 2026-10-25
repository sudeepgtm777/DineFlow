import React from "react";
import { NavLink } from "@/lib/router";
import Logo from "@/components/brand/Logo";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Table2,
  BedDouble,
  CreditCard,
  BarChart3,
  Wallet,
  Settings,
  Calendar,
} from "lucide-react";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "flex items-center space-x-4 p-3 rounded-lg bg-gray-700 transition-all"
    : "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-all";

const Sidebar = ({ isOpen = false, onClose }: any) => {
  return (
    <div
      className={`h-full w-64 bg-gray-800 text-white p-6 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-center mb-8">
        <Logo
          href="/admin/dashboard"
          size="lg"
          wordmarkClassName="text-2xl font-bold text-white tracking-tight"
        />
      </div>

      <ul className="space-y-4" onClick={onClose}>
        <li>
          <NavLink to="/admin/dashboard" className={linkClass}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={linkClass}>
            <ShoppingBag className="w-5 h-5" />
            <span>Manage Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/menu" className={linkClass}>
            <UtensilsCrossed className="w-5 h-5" />
            <span>Menu Management</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/table-stats" className={linkClass}>
            <Table2 className="w-5 h-5" />
            <span>Tables Manager</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/room-stats" className={linkClass}>
            <BedDouble className="w-5 h-5" />
            <span>Room Manager</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reservations" className={linkClass}>
            <Calendar className="w-5 h-5" />
            <span>Reservations</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/pos" className={linkClass}>
            <CreditCard className="w-5 h-5" />
            <span>POS</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reports" className={linkClass}>
            <BarChart3 className="w-5 h-5" />
            <span>Reports</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/get-total" className={linkClass}>
            <Wallet className="w-5 h-5" />
            <span>Get Total</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/settings" className={linkClass}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
