import { useAuth } from "../Providers/AuthContextProvider";
import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = () => {
    const { isLoading, isLoggedIn } = useAuth();

    if (isLoading) {
        return;
    }

    return !isLoggedIn ? <Outlet /> : <Navigate to={"/dashboard"} />;
};

export default PublicRoutes;
