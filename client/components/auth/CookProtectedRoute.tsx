import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { useNavigate } from "@/lib/router";

const CookProtectedRoute = ({ children }) => {
    const { user, hydrated } = useAppSelector((store) => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!hydrated) return;
        if (!user || user.role !== "cook") {
            navigate(user?.role === "pending" ? "/pending" : "/login", {
                replace: true,
            });
        }
    }, [user, hydrated, navigate]);

    if (!hydrated || !user || user.role !== "cook") {
        return <div>Loading...</div>;
    }

    return children;
};

export default CookProtectedRoute;
