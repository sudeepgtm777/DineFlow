import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/redux/hooks";

const roleBadge = (role: string) => {
  if (role === "admin") return "bg-red-100 text-red-800";
  if (role === "cook") return "bg-blue-100 text-blue-800";
  return "bg-amber-100 text-amber-800";
};

const Settings = () => {
  const { user: currentUser } = useAppSelector((store) => store.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${endpoints.user}/all`, {
        withCredentials: true,
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const pendingUsers = users.filter((user) => user.role === "pending");
  const staffUsers = users.filter((user) => user.role !== "pending");
  const adminCount = staffUsers.filter((user) => user.role === "admin").length;

  const runAction = async (userId: string, path: string, successMsg?: string) => {
    try {
      setBusyId(userId);
      const response = await api.put(
        `${endpoints.user}/${path}/${userId}`,
        {},
        { withCredentials: true },
      );
      toast.success(successMsg || response.data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setBusyId("");
    }
  };

  const UserRow = ({
    user,
    actions,
  }: {
    user: any;
    actions: React.ReactNode;
  }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <img
          src={
            user.profile?.profilePhoto ||
            "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=40"
          }
          alt={user.fullname}
          className="h-10 w-10 rounded-full object-cover"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.phoneNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadge(
            user.role,
          )}`}
        >
          {user.role === "pending" ? "pending cook" : user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {actions}
      </td>
    </tr>
  );

  const tableHead = (
    <thead>
      <tr className="bg-gray-50">
        {["Profile", "Name", "Email", "Phone", "Role", "Actions"].map(
          (label) => (
            <th
              key={label}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {label}
            </th>
          ),
        )}
      </tr>
    </thead>
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve cook requests, then manage staff roles.
        </p>
      </div>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Pending cook requests
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          New signups wait here until you approve them as cooks.
        </p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              {tableHead}
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    actions={
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === user._id}
                          onClick={() => runAction(user._id, "approve")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === user._id}
                          onClick={() => runAction(user._id, "reject")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : staffUsers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No staff yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              {tableHead}
              <tbody className="bg-white divide-y divide-gray-200">
                {staffUsers.map((user) => {
                  const isSelf =
                    currentUser?._id && user._id === currentUser._id;
                  const isLastAdmin = user.role === "admin" && adminCount <= 1;
                  return (
                    <UserRow
                      key={user._id}
                      user={user}
                      actions={
                        user.role === "admin" ? (
                          <button
                            type="button"
                            disabled={Boolean(isSelf || isLastAdmin || busyId)}
                            onClick={() => runAction(user._id, "demote")}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                          >
                            {isSelf
                              ? "You"
                              : isLastAdmin
                                ? "Last admin"
                                : "Demote"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => runAction(user._id, "promote")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                          >
                            Promote to Admin
                          </button>
                        )
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Settings;
