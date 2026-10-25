import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useKitchenStatus = () => {
  const [kitchenStatus, setKitchenStatus] = useState({
    pending: 0,
    inProgress: 0,
    prepared: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchKitchenStatus = async () => {
      try {
        const res = await api.get(
          `${endpoints.order}/orders/filter?filter=daily`,
        );
        const orders = res?.data?.orders || [];

        const pending = orders.filter(
          (order) => order.status === "pending",
        ).length;
        const inProgress = orders.filter(
          (order) => order.status === "in-progress",
        ).length;
        const prepared = orders.filter(
          (order) => order.status === "completed",
        ).length;

        setKitchenStatus({ pending, inProgress, prepared });
        setError(null);
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
