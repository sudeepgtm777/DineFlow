// @ts-nocheck
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints";

const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.order);
      setOrders(response.data.orders);
      setTotalOrders(response.data.totalOrders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, totalOrders, loading, error, refetch: fetchOrders };
};

export default useOrder;
