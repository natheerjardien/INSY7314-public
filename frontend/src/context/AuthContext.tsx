import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Defining the interface for our Auth Context state (Microsoft, 2026)
interface AuthContextType {
    token: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
}

// Creating the Context object with an initial undefined value (Meta Platforms, Inc., 2026a)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The Provider component wraps our app to supply the authentication state globally
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initializing state to hold the JWT and the users role (Meta Platforms, Inc., 2026b)
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Checks local storage on initial load so users remain logged in after page refreshes (Meta Platforms, Inc., 2026c)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        
        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
        }
    }, []);

    // Function to update global state and persist session data when login is successful
    const login = (newToken: string, newRole: string) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', newRole);
    };

    // Function to clear global state and wipe session data when the user signs out
    const logout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    };

    return (
        // Passes the state and functions down the component tree (Meta Platforms, Inc., 2026a)
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/* 
Reference List

Meta Platforms, Inc., 2026a. createContext (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/createContext > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026b. useState (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026c. useEffect (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useEffect > [Accessed 08 October 2026]
Microsoft, 2026. Type-Only Imports and Exports (Version 5.0) [online] Available at: < https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export > [Accessed 08 October 2026]
*/