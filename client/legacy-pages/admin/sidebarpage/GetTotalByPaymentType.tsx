import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

const GetTotalByPaymentType = () => {
  const [totals, setTotals] = useState({
    totalSales: 0,
    totalCash: 0,
    totalOnline: 0,
    totalCredit: 0,
  });
  const [bills, setBills] = useState<any[]>([]);
  const [filteredBills, setFilteredBills] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paymentTypeIcons = {
    cash: "💵",
    online: "🌐",
    credit: "🕓",
    all: "📊",
  };

  useEffect(() => {
    fetchTotals();
    fetchBills();
  }, [timeRange]);

  const fetchTotals = async () => {
    try {
      const res = await api.get(
        `${endpoints.pos}/sales?range=${timeRange}`,
        { withCredentials: true }
      );
      const data = res.data || {};
      setTotals({
        totalSales: data.totalSales || 0,
        totalCash: data.totalCash || 0,
        totalOnline: data.totalOnline || 0,
        totalCredit: data.totalCredit || 0,
      });
      setError("");
    } catch {
      setError("Failed to fetch payment totals");
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${endpoints.pos}/all-bills`, {
        withCredentials: true,
      });
      const data = res?.data || [];

      const now = new Date();
      let start, end;
      switch (timeRange) {
        case "today":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(start);
          end.setDate(start.getDate() + 1);
          break;
        case "week": {
          const current = new Date();
          const dayOfWeek = current.getDay();
          start = new Date(current);
          start.setDate(current.getDate() - dayOfWeek);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 7);
          break;
        }
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear() + 1, 0, 1);
          break;
        default:
          start = null;
          end = null;
      }

      const filtered = data.filter((bill) => {
        const createdAt = new Date(bill.createdAt);
        return createdAt >= start && createdAt < end;
      });

      setBills(filtered);
    } catch {
      setError("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered =
      activeFilter === "all"
        ? bills
        : bills.filter((bill) => {
            if (activeFilter === "cash") {
              return (bill.cash || 0) > 0 || bill.paymentMethod === "cash";
            }
            if (activeFilter === "online") {
              return (bill.online || 0) > 0 || bill.paymentMethod === "online";
            }
            if (activeFilter === "credit") {
              return (bill.credit || 0) > 0 || bill.paymentMethod === "credit";
            }
            return bill.paymentMethod === activeFilter;
          });
    setFilteredBills(filtered);
  }, [bills, activeFilter]);

  const handleCreditTransfer = async (billId) => {
    const transferTo = prompt("Transfer to (cash/online):")?.toLowerCase() || "";
    const amount = parseFloat(prompt("Enter amount to transfer:") || "");

    if (!["cash", "online"].includes(transferTo) || isNaN(amount)) {
      toast.error("Invalid input");
      return;
    }

    try {
      await api.post(
        `${endpoints.pos}/transfer-credit`,
        { billId, transferTo, amount },
        { withCredentials: true }
      );
      toast.success("Transfer successful");
      fetchBills();
      fetchTotals();
    } catch (err) {
      console.error(err);
      toast.error("Transfer failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-lg">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        Payment Summary & Transactions
      </h1>

      {/* Time Range Filter */}
      <div className="mb-4 flex gap-2">
        {["today", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
              timeRange === range
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Total Sales */}
      <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded p-4 shadow">
        <h2 className="text-lg font-semibold text-indigo-700">Total Sales</h2>
        <p className="text-2xl font-bold text-indigo-900">
          Rs. {totals.totalSales.toLocaleString()}
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(totals).map(([key, value]) => {
          if (key === "totalSales") return null;
          const type = key.replace("total", "").toLowerCase();
          return (
            <div
              key={key}
              className="bg-white p-4 rounded border border-gray-200 shadow"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">{paymentTypeIcons[type]}</div>
                <div>
                  <div className="text-sm uppercase text-gray-500">{type}</div>
                  <div className="text-xl font-bold">
                    Rs. {value.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter by Payment Type */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "cash", "online", "credit"].map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 rounded text-sm capitalize flex items-center ${
              activeFilter === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="mr-1">{paymentTypeIcons[type]}</span>
            {type === "all" ? "All Transactions" : type}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded">
          <p className="text-gray-600">
            No transactions found for this range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Customer",
                  "Contact",
                  "Type",
                  "Total",
                  "Cash",
                  "Online",
                  "Credit",
                  "Time",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredBills.map((bill, idx) => (
                <tr key={bill._id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">
                    {bill?.customerDetails?.name || "Guest"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {bill?.customerDetails?.contact || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 capitalize">
                    <span className="inline-flex items-center">
                      {paymentTypeIcons[bill.paymentMethod]}{" "}
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold">
                    Rs. {bill?.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Rs. {bill?.cash?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Rs. {bill?.online?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Rs. {bill?.credit?.toLocaleString()}
                    {bill.credit > 0 && (
                      <button
                        onClick={() => handleCreditTransfer(bill._id)}
                        className="ml-2 text-blue-600 underline text-xs"
                      >
                        Transfer
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(bill.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetTotalByPaymentType;
