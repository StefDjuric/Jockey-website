import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

type AuthContextType = {
    isLoading: boolean;
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
};

type AuthProviderProps = {
    children: ReactNode;
};

const AuthContext = createContext<AuthContextType>({
    isLoading: true,
    isLoggedIn: false,
    setIsLoggedIn: () => {},
});

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/check-auth",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(data?.data?.isLoggedIn);
            }
        } catch (error: any) {
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoading, isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an Auth provider!");
    }
    return context;
}
