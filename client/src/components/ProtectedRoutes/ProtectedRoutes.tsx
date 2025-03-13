import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../Providers/AuthContextProvider";

const ProtectedRoutes = () => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return;
    }

    return isLoggedIn ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default ProtectedRoutes;
