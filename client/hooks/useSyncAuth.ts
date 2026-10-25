import { useEffect } from "react";
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
      } catch {
        if (!cancelled) {
          dispatch(logout());
        }
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
};

export default useSyncAuth;
