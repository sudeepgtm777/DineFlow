import { useEffect } from "react";
import axios from "axios";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout, setUser } from "@/lib/redux/authSlice";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useSyncAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await api.get(`${endpoints.user}/check-login-status`);
        if (cancelled) return;
        if (response.data?.success && response.data.user) {
          dispatch(setUser(response.data.user));
          return;
        }
        dispatch(logout());
      } catch (error) {
        if (cancelled) return;
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404 || status === 502 || !axios.isAxiosError(error) || !error.response) {
          return;
        }
        dispatch(logout());
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
};

export default useSyncAuth;
