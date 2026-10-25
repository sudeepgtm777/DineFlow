import { useState } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useNavigate } from "@/lib/router";
import api from "@/lib/axios";
import { setLoading } from "@/lib/redux/authSlice";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

const useSignup = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [loading, setLocalLoading] = useState(false);

    const submitHandler = async (values, { setSubmitting, resetForm }) => {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
            if (values[key]) formData.append(key, values[key]);
        });

        try {
            setLocalLoading(true);
            dispatch(setLoading(true));

            const res = await api.post(`${endpoints.user}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (res.data.success) {
                toast.success(
                    res.data.message ||
                        "You have requested to be Cook. Check later.",
                );
                resetForm();
                navigate("/pending");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
            setSubmitting(false);
        }
    };

    return { loading, submitHandler };
};

export default useSignup;
