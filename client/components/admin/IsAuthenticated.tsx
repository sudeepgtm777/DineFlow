// @ts-nocheck
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "@/lib/router";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useSelector((store: any) => store.auth);
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);


    useEffect(() => {
        if (!loading) {
            if (!user) {
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

export default ProtectedRoute;
