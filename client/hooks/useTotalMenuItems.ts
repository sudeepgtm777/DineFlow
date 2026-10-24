import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useTotalMenuItems = () => {
  const [totalMenuItems, setTotalMenuItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get(`${endpoints.menuItem}/menu-item-count`);
        setTotalMenuItems(response.data.totalCount || 0);
      } catch (err) {
        setError("Failed to fetch menu item stats");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { totalMenuItems, loading, error };
};

export default useTotalMenuItems;
