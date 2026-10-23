// @ts-nocheck
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const useKitchenStatus = () => {
  const [kitchenStatus, setKitchenStatus] = useState({ pending: 0, prepared: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKitchenStatus = async () => {
      try {
        const res = await api.get("/order/orders/filter");
        const orders = res?.data?.orders || [];

        const pending = orders.filter((order) => order.status === "pending").length;
        const prepared = orders.filter((order) => order.status === "completed").length;

        setKitchenStatus({ pending, prepared });
      } catch (err) {
        setError("Failed to fetch kitchen status");
      } finally {
        setLoading(false);
      }
    };

    fetchKitchenStatus();
  }, []);

  return { kitchenStatus, loading, error };
};

export default useKitchenStatus;
