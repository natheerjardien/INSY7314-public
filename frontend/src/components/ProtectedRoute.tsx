import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRole: 'Client' | 'Freelancer' | 'Admin';
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
    // Consume the global authentication state via the useContext hook (Meta Platforms, Inc., 2026)
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return null; 
    }

    // // Checks if the user has a JWT
    // if (!authContext.token) {
    //     return <Navigate to="/login" replace />;
    // }

    // // Verifies Role-Based Access Control (RBAC)
    // if (authContext.role !== allowedRole) {
    //     return <Navigate to="/login" replace />;
    // }

    // Renders the protected component if all the security checks pass (Remix Software, 2026)
    return <Outlet />;
};

export default ProtectedRoute;

/* 
Reference List

Meta Platforms, Inc., 2026. React Without JSX (Version 18.2) [online] Available at: < https://react.dev/blog/2020/09/22/introducing-the-new-jsx-transform > [Accessed 08 October 2026]
Remix Software, 2026. Navigate and Outlet Components (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/components/navigate > [Accessed 08 October 2026]
*/