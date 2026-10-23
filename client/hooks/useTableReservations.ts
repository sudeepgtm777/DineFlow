// @ts-nocheck
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const useTableReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get("/api/reservations"); // Modify the endpoint as needed
        setReservations(res.data);
        setAvailableTables(res.data.filter(table => !table.reserved)); // Example filter for available tables
      } catch (err) {
        setError("Failed to fetch table reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return { reservations, availableTables, loading, error };
};

export default useTableReservations;
