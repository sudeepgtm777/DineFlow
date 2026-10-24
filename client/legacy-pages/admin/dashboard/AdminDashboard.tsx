// src/components/AdminDashboard.js
import React from "react";
import { Link } from "@/lib/router";
import useKitchenStatus from "@/hooks/useKitchenStatus";
// import useStaffManagement from "@/hooks/useStaffManagement";
import useOrderStats from "@/hooks/useOrderStats";
import useDailySales from "@/hooks/useDailySales";
import useTotalMenuItems from "@/hooks/useTotalMenuItems";
import useTableStats from "@/hooks/useTableStats";
import { ShoppingBag, DollarSign, UtensilsCrossed, Plus, UserPlus, Boxes, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const { totalOrders, loading: ordersLoading, error: ordersError } = useOrderStats();
  const { data: dailySales, loading: salesLoading, error: salesError } = useDailySales();
  const { totalMenuItems, loading: menuLoading, error: menuError } = useTotalMenuItems();
  const { kitchenStatus, loading: kitchenLoading, error: kitchenError } = useKitchenStatus();
  // const { staffStatus, loading: staffLoading, error: staffError } = useStaffManagement();
  const { stats: tableStats, loading: tableStatsLoading, error: tableStatsError } = useTableStats();

  const StatCard = ({ title, value, icon, color, loading, error, link }) => {
    const content = (
      <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500 hover:shadow-md transition-all h-full flex flex-col`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 flex items-end">
          {loading ? (
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          )}
        </div>
      </div>
    );
    return link ? <Link to={link}>{content}</Link> : content;
  };

  const StatusCard = ({ title, items, loading, error }) => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
        {loading ? (
          <div className="space-y-3">
            <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your restaurant today.</p>
      </header>

      {/* Key Metrics Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={totalOrders || 0}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="blue"
            loading={ordersLoading}
            error={ordersError}
            link="/admin/orders"
          />
        <StatCard
  title="Total Sales Today"
  value={`Rs. ${dailySales.totalSales || 0}`}
  icon={<DollarSign className="w-5 h-5" />}
  color="green"
  loading={salesLoading}
  error={salesError}
  link="/admin/reports"
/>

          <StatCard
            title="Menu Items"
            value={totalMenuItems || 0}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            color="purple"
            loading={menuLoading}
            error={menuError}
            link="/admin/menu"
          />
        </div>
      </section>

      {/* Status Sections */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatusCard
            title="Kitchen Status"
            loading={kitchenLoading}
            error={kitchenError}
            items={[
              { label: "Pending Orders", value: kitchenStatus?.pending || 0 },
              { label: "Prepared Orders", value: kitchenStatus?.prepared || 0 },
            ]}
          />
          {/* <StatusCard
            title="Staff Management"
            loading={staffLoading}
            error={staffError}
            items={[
              { label: "Active Staff", value: staffStatus?.active || 0 },
              { label: "Total Staff", value: staffStatus?.total || 0 },
            ]}
          /> */}
          <StatusCard
            title="Table Reservations"
            loading={tableStatsLoading}
            error={tableStatsError}
            items={[
              { label: "Total Tables", value: tableStats?.totalTables || 0 },
              { label: "Booked Tables", value: tableStats?.bookedTables || 0 },
              { label: "Unbooked Tables", value: tableStats?.unbookedTables || 0 }, // Replaced activeTables
            ]}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/dashboard/add"
            className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-center flex-col"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-700">Add Menu Item</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Create a new dish for your menu</p>
          </Link>

          {/* <Link
            to="/admin/staff/add"
            className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 hover:border-green-500 hover:shadow-md transition-all flex items-center justify-center flex-col"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
              <i className="fas fa-user-plus text-xl"></i>
            </div>
            <h3 className="font-medium text-gray-700">Add Staff Member</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Onboard new restaurant staff</p>
          </Link> */}

          {/* <Link
            to="/admin/inventory"
            className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 hover:border-yellow-500 hover:shadow-md transition-all flex items-center justify-center flex-col"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3">
              <i className="fas fa-boxes text-xl"></i>
            </div>
            <h3 className="font-medium text-gray-700">Manage Inventory</h3>
            <p className="text-sm text-gray-500 text-center mt-1">View and update stock levels</p>
          </Link> */}

          <Link
            to="/admin/reservations"
            className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-center flex-col"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-700">View Reservations</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Check upcoming bookings</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;