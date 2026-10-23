// @ts-nocheck
// src/hooks/useDailySales.js
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useDailySales = () => {
  const [data, setData] = useState({ totalSales: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${endpoints.pos}/daily-sales`, {
        withCredentials: true,
      });
      setData({
        totalSales: res.data.totalSales || 0,
        orders: res.data.orders || 0,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching daily sales:", err);
      setError("Failed to fetch daily sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error };
};

export default useDailySales;
