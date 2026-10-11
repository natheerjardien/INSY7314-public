import React, { useState } from 'react';
// Import routing tools to navigate users between authentication screens (Remix Software, 2026).
import { useNavigate, Link } from 'react-router-dom';
// Pulling in our centralized API service so we dont have to hardcode backend URLs anymore (Axios, 2024).
import { registerUser } from '../services/api';

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

const Register = () => {
    // Managing multiple input states for the registration payload (Meta Platforms, Inc., 2026a).
    // These states correspond directly to our backend Mongoose User schema.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Defaults the select dropdown to Client to ensure a valid role is always passed.
    const [role, setRole] = useState('Client');
    
    // UI feedback states for graceful error handling and request loading management.
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Controls the password visibility toggle

    const navigate = useNavigate();

    // The form submission handler for creating a new user account.
    const handleRegister = async (e: React.FormEvent) => {
        // Intercept the default form submission to handle data fetching manually via JavaScript (Meta Platforms, Inc., 2026b).
        e.preventDefault(); 
        
        setError('');

        // Password validation (Mozilla, 2026a).
        // Requires min 8 chars, 1 uppercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) 
            {
            setError('Password must be at least 8 characters, include a capital letter, a number and a special character.');
            return;
        }

        setIsLoading(true);

        try {
            // Using our Axios setup to talk to the backend, which automatically uses the correct HTTPS base URL (Axios, 2024).
            await registerUser({ name, email, password, role });

            // On successful registration the user is redirected to the login page (Remix Software, 2026).
            navigate('/login');

        } catch (err: any) {
            // Axios nests the backends error message inside err.response.data (Axios, 2024).
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';

            // Gracefully catch the error and update the UI without breaking the application runtime.
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Styling configuration using a centralized object to maintain JSX readability while providing a modern aesthetic.
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            // Applying a background image using a placeholder URL
            // The linear-gradient acts as a dark overlay (40% opacity) so the white card stands out clearly (W3C, 2026a).
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/tiago-wolf-W4CTDtL2LQo-unsplash.jpg")',
            // Ensures the image scales to cover the entire viewport without stretching or distorting (W3C, 2026b).
            backgroundSize: 'cover',
            // Centers the image so the focal point remains visible regardless of screen size (W3C, 2026b).
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
        select: {
            width: '100%',
            padding: '12px',
            marginBottom: '24px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            color: '#111827',
            fontSize: '15px',
            cursor: 'pointer',
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

        // Custom styles for the password visibility toggle
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

                <h1 style={styles.title}>Create Account</h1>
                
                {/* Conditionally render error messages inline to ensure the interface handles invalid inputs gracefully. */}
                {error && (
                    <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="name" style={styles.label}>Full Name</label>
                        <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={styles.input}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
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
                                style={styles.passwordInput}
                                placeholder="Min. 8 characters"
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

                    <div>
                        <label htmlFor="role" style={styles.label}>Account Type</label>
                        <select 
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={styles.select}
                        >
                            <option value="Client">Hire a Freelancer (Client)</option>
                            <option value="Freelancer">Offer My Services (Freelancer)</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={styles.footerText}>
                    Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

/* 
Reference List

Axios, 2024. Handling Errors (Version 1.7) [Source Code] Available at: < https://axios-http.com/docs/handling_errors > [Accessed 10 October 2026]
Meta Platforms, Inc., 2026a. useState Hook (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026b. React DOM Events (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react-dom/components/common > [Accessed 08 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 08 October 2026]
Remix Software, 2026. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 08 October 2026]
W3C, 2026a. CSS Image Values and Replaced Content Module Level 3. [online] Available at: < https://www.w3.org/TR/css-images-3/ > [Accessed 08 October 2026]
W3C, 2026b. CSS Backgrounds and Borders Module Level 3. [online] Available at: < https://www.w3.org/TR/css-backgrounds-3/ > [Accessed 08 October 2026]
*/