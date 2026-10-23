// @ts-nocheck
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/redux/authSlice"; 
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useSyncAuth = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth);

    useEffect(() => {
        const syncAuthStatus = async () => {
            try {
                const response = await api.get(`${endpoints.user}/check-login-status`, {
                    withCredentials: true
                });

                if (!response.data.success) {
                    throw new Error("User not authenticated");
                }
            } catch (error) {
                console.log("Syncing auth: User logged out on the server. Logging out on frontend...");
                dispatch(logout()); // Log out from Redux store
            }
        };

        if (user) {
            syncAuthStatus();
        }
    }, [dispatch, user]);
};

export default useSyncAuth;