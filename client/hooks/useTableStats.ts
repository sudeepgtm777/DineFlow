// @ts-nocheck
// src/hooks/useTableStats.js
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { endpoints } from "@/lib/api/endpoints";

const useTableStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get(`${endpoints.table}/totaldocuments`, { withCredentials: true });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching table stats:", err);
      setError("Failed to load table stats: " + err.message);
      toast.error("Failed to load table stats: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error };
};

export default useTableStats;