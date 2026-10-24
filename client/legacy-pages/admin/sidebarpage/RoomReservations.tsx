import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import moment from "moment";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

const AdminRoomBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      const res = await api.get(`${endpoints.booking}/getbookings`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update status handler
  const updateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(
        `${endpoints.booking}/${bookingId}`,
        { status: newStatus },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      fetchBookings();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update booking status.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-yellow-100 text-yellow-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "checked-out":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Room Reservations Dashboard
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600 animate-pulse">
            Loading bookings...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">No reservations found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full bg-white text-sm rounded-xl">
            <thead className="bg-gray-200 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Price/Night</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Check-in</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const room = booking.room || {};
                const status = booking.status?.toLowerCase();

                return (
                  <tr
                    key={booking._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {room.roomNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">
                      {room.roomType || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {room.pricePerNight
                        ? `Rs. ${room.pricePerNight}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {room.capacity || "?"} pax
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {booking.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {booking.contactNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {moment(booking.checkInDate || booking.createdAt).format(
                        "YYYY-MM-DD hh:mm A"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      {status === "booked" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(booking._id, "checked-in")
                            }
                            className="bg-blue-600 text-white px-4 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(booking._id, "cancelled")
                            }
                            className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {status === "checked-in" && (
                        <button
                          onClick={() =>
                            updateStatus(booking._id, "checked-out")
                          }
                          className="bg-green-600 text-white px-4 py-1 rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          Check Out
                        </button>
                      )}
                      {["checked-out", "cancelled"].includes(status) && (
                        <span className="text-gray-500 text-xs font-medium">
                          {status === "cancelled" ? "Cancelled" : "Completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRoomBookings;