import React, { useState, useContext } from 'react';
// The useNavigate hook allows for programmatic navigation, while Link is used for declarative routing (Remix Software, 2026)
import { useNavigate, Link } from 'react-router-dom';
// Importing the AuthContext to consume our global authentication state (Meta Platforms, Inc., 2026c)
import { AuthContext } from '../context/AuthContext';
// Using our custom API module to handle the secure backend connection (Axios, 2024).
import { loginUser } from '../services/api';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const Login = () => {
    // useState is a React Hook that lets you add state variables to functional components (Meta Platforms, Inc., 2026a)
    // We use it here to track the user's email and password inputs dynamically
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // State to handle error messages gracefully without exposing system logs to the frontend
    const [error, setError] = useState('');
    
    // State to manage the loading status, ensuring users cannot spam the login button while a request is processing
    const [isLoading, setIsLoading] = useState(false);

    // State to manage the visibility toggle (Meta Platforms, Inc., 2026a).
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // Consumes the global authentication state via the useContext hook (Meta Platforms, Inc., 2026c)
    const authContext = useContext(AuthContext);

    // Asynchronous function triggered when the user submits the login form.
    const handleLogin = async (e: React.FormEvent) => {
        // Prevents the default HTML form behaviour of refreshing the page on submission (Meta Platforms, Inc., 2026b)
        e.preventDefault(); 
        
        // Resets the error state on every new submission attempt
        setError('');
        setIsLoading(true);

        try {
            const response = await loginUser({ email, password });
            
            // Axios automatically parses the JSON so we can access the data directly
            const data = response.data;

            // Securely stores the JWT and role in our global context state rather than directly accessing localStorage here
            if (authContext) {
                authContext.login(data.token, data.user.role);
            }

            // Conditional routing based on the Role-Based Access Control (RBAC)
            if (data.user.role === 'Freelancer') {
                navigate('/freelancer-dashboard');
            } else {
                navigate('/client-dashboard');
            }

        } catch (err: any) {
            // Safely extracts the backend error message if the credentials fail (Axios, 2024).
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            // Catches any network or validation errors and updates the error state to display a user-friendly message
            setError(errorMessage);
        } finally {
            // Ensures the loading state is turned off regardless of a successful or failed request
            setIsLoading(false);
        }
    };

    // Modern styling objects utilizing a clean, white "card" layout with soft shadows and rounded corners
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            // Applying a background image using a placeholder URL
            // The linear-gradient acts as a dark overlay (40% opacity) so the white card stands out clearly (W3C, 2026a)
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/tiago-wolf-W4CTDtL2LQo-unsplash.jpg")',
            // Ensures the image scales to cover the entire viewport without stretching or distorting (W3C, 2026b)
            backgroundSize: 'cover',
            // Centers the image so the focal point remains visible regardless of screen size (W3C, 2026b)
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        },
        logoContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '15px',
        },
        logoText: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2563eb',
            margin: 0,
            letterSpacing: '-0.5px',
        },
        card: {
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '420px',
        },
        title: {
            margin: '0 0 24px 0',
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center' as const,
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            color: '#4b5563',
            fontSize: '14px',
            fontWeight: '500',
        },
        input: {
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            color: '#111827',
            fontSize: '15px',
            boxSizing: 'border-box' as const,
            outline: 'none',
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb', 
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
        },
        footerText: {
            marginTop: '20px',
            textAlign: 'center' as const,
            color: '#6b7280',
            fontSize: '14px',
        },
        link: {
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: '500',
        },

        // Relative container to hold the absolute-positioned icon button (W3C, 2026).
        passwordContainer: { 
            position: 'relative' as const, 
            display: 'flex', 
            alignItems: 'center' 
        },
        passwordInput: { 
            width: '100%', 
            padding: '12px', 
            paddingRight: '45px', 
            marginBottom: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            backgroundColor: '#f9fafb', 
            color: '#111827', 
            fontSize: '15px', 
            boxSizing: 'border-box' as const, 
            outline: 'none' 
        },
        eyeButton: { 
            position: 'absolute' as const, 
            right: '12px', 
            top: '10px', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#6b7280', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <h4 style={styles.logoText}>HustleHub+</h4>
                </div>

                <h1 style={styles.title}>Welcome Back</h1>

                {/* Graceful error handling: Conditionally renders a stylized error toast if the error state is populated. */}
                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            // The onChange event updates the state dynamically on every keystroke (Meta Platforms, Inc., 2026b)
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <div style={styles.passwordContainer}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                style={styles.input}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                style={styles.eyeButton}
                                title={showPassword ? "Hide Password" : "Show Password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={styles.footerText}>
                    Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

/* 
Reference List

Meta Platforms, Inc., 2026a. useState Hook (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026b. React DOM Events (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react-dom/components/common > [Accessed 08 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 08 October 2026]
Remix Software, 2026. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 08 October 2026]
W3C, 2026a. CSS Image Values and Replaced Content Module Level 3. [online] Available at: < https://www.w3.org/TR/css-images-3/ > [Accessed 08 October 2026]
W3C, 2026b. CSS Backgrounds and Borders Module Level 3. [online] Available at: < https://www.w3.org/TR/css-backgrounds-3/ > [Accessed 08 October 2026]
*/