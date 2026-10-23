// @ts-nocheck
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useTotalRevenue = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${endpoints.pos}/daily-sales`, {
        withCredentials: true,
      });
      setTotalRevenue(response.data.totalRevenue || 0);
      setError(null);
    } catch (err) {
      setError("Failed to fetch revenue stats");
      console.error("Error fetching total revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  return { totalRevenue, loading, error, refetch: fetchRevenue };
};
export default useTotalRevenue;

