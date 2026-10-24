import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { useNavigate } from "@/lib/router";

const AdminProtectedRoute = ({ children }) => {
    const { user, loading } = useAppSelector((store) => store.auth);
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== "admin") {
                navigate("/login", { replace: true });
            }
            setCheckingAuth(false);
        }
    }, [user, loading, navigate]);

    if (loading || checkingAuth) {
        return <div>Loading...</div>; // Prevent UI flickering
    }

    return children;
};

export default AdminProtectedRoute;
