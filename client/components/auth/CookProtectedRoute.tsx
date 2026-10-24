import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { useNavigate } from "@/lib/router";

const CookProtectedRoute = ({ children }) => {
    const { user, loading } = useAppSelector((store) => store.auth);
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== "cook") {
                navigate("/login", { replace: true });
            }
            setCheckingAuth(false);
        }
    }, [user, loading, navigate]);

    if (loading || checkingAuth) {
        return <div>Loading...</div>;
    }

    return children;
};

export default CookProtectedRoute;
