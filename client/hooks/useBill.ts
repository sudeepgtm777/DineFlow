// @ts-nocheck
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await api.get(`${endpoints.table}/gettables`, { withCredentials: true });
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch tables error:", err);
      toast.error("Failed to load tables");
      setTables([]);
    }
  };

  const createTable = async (newTableNumber) => {
    if (!newTableNumber) return toast.warning("Please enter a table number");
    try {
      setLoading(true);
      await api.post(`${endpoints.table}/createtable`, {withCredentials: true}, {
        tableNumber: Number(newTableNumber),
      });
      toast.success("Table created!");
      await fetchTables();
    } catch (err) {
      console.error("Create table error:", err);
      toast.error(err?.response?.data?.message || "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  const releaseTable = async (tableNumber) => {
    try {
      setLoading(true);
      await api.put(`${endpoints.table}/release/${tableNumber}`, {}, { withCredentials: true });
      toast.success("Table released");
      await fetchTables();
    } catch (err) {
      console.error("Release table error:", err);
      toast.error(err?.response?.data?.message || "Failed to release table");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return { tables, loading, createTable, releaseTable, fetchTables };
};