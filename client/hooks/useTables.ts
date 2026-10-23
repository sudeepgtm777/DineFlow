// @ts-nocheck
import { useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

export const useBill = () => {
  const [billData, setBillData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBill = async (tableNumber) => {
    try {
      const res = await api.get(
        `${endpoints.bill}/table/${tableNumber}`,
        {
          withCredentials: true,
        }
      );
      setBillData(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Fetch bill error:", err);
      toast.error("Failed to load bill");
    }
  };

  return { billData, showModal, fetchBill, setShowModal };
};
