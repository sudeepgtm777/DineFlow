"use client";

import { useState } from "react";
import Logo from "@/components/brand/Logo";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { useNavigate } from "@/lib/router";

const PendingCook = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleBackToLogin = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await api.get(`${endpoints.user}/logout`);
    } catch {
      // Already signed out is fine.
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <Logo href="/" size="lg" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Request received
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          You have requested to be Cook. Check later.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          An admin will review your request. Once approved, sign in to open the
          kitchen board.
        </p>
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={leaving}
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold"
        >
          {leaving ? "Returning..." : "Back to login"}
        </button>
      </div>
    </div>
  );
};

export default PendingCook;
