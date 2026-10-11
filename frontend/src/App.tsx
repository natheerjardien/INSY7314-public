// BrowserRouter, Routes, and Route are core components used to enable URL-based navigation across the application (React Router, 2026)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Importing the AuthProvider to wrap the routing logic (Meta Platforms, Inc., 2026)
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditGig from './pages/EditGig';

const App = () => {
    return (
        // The AuthProvider ensures that the JWT and user role state are accessible to every route inside the application (Meta Platforms, Inc., 2026).
        <AuthProvider>
            {/* Router wraps the entire application to synchronize the UI components with the browser's current URL (React Router, 2026). */}
            <Router>
                {/* Added a subtle global background wrapper to center the forms and improve the base aesthetic */}
                <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px' }}>
                    <Routes>
                        {/* The Navigate component forces users who land on the root URL ("/") to immediately redirect to the login screen (React Router, 2026). */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        
                        {/* Public authentication routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes for Clients */}
                        {/* The Route element wrapping the dashboard enforces the RBAC security check (Remix Software, 2026). */}
                        <Route element={<ProtectedRoute allowedRole="Client" />}>
                            <Route path="/client-dashboard" element={<ClientDashboard />} />
                        </Route>

                        {/* Protected Routes for Freelancers */}
                        <Route element={<ProtectedRoute allowedRole="Freelancer" />}>
                            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
                        </Route>

                        {/* Protected Routes for Admins */}
                        <Route element={<ProtectedRoute allowedRole="Admin" />}>
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        </Route>

                        {/* Protected Routes for Freelancers (Updated with Edit view) */}
                        <Route element={<ProtectedRoute allowedRole="Freelancer" />}>
                            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
                            <Route path="/edit-gig/:id" element={<EditGig />} />
                        </Route>
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;

/* 
Reference List

Meta Platforms, Inc., 2026. Passing Data Deeply with Context (Version 18.2) [online] Available at: < https://react.dev/learn/passing-data-deeply-with-context > [Accessed 08 October 2026]
React Router, 2026. React Router Documentation (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/components/browser-router > [Accessed 08 October 2026]
*/