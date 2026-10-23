// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useOrderStats = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`${endpoints.order}/orders`);
      setTotalOrders(response.data.totalOrders || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching order stats:", err);
      setError(err.response?.data?.message || "Failed to fetch order stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats]);

  return { totalOrders, loading, error, refetch: fetchOrderStats };
};

export default useOrderStats;
