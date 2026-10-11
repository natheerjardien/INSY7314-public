import { useState, useEffect, useContext } from 'react';
// useNavigate redirects the user after logging out (Remix Software, 2026).
import { useNavigate } from 'react-router-dom';
// AuthContext provides the JWT required for secure backend requests (Meta Platforms, Inc., 2026a).
import { AuthContext } from '../context/AuthContext';
// Pulling in our Axios service which handles the token interceptor automatically
import { fetchGigs, createBooking } from '../services/api';

interface Gig {
    _id: string;
    id?: string; // Fallback for local JSON storage mode
    title: string;
    description: string;
    price: number;
    category: string;
    freelancer: any;
}

const ClientDashboard = () => {
    // State initialization for gigs and UI feedback (Meta Platforms, Inc., 2026b).
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isBooking, setIsBooking] = useState<string | null>(null); // Tracks which gig is currently being booked

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetches gigs (Meta Platforms, Inc., 2026c).
    useEffect(() => {
        fetchAllGigs();
    }, []);

    const fetchAllGigs = async () => {
        try {
            // Using Axios to fetch gigs ensures the token is attached correctly every time
            const response = await fetchGigs();
            setGigs(response.data.gigs || []);
        } catch (err: any) {
            // Axios nests the servers error message under err.response.data.message
            setError(err.response?.data?.message || 'Failed to load marketplace data.');
        } 
        finally 
        {
            setIsLoading(false);
        }
    };

    const handleBookGig = async (gigId: string) => {
        setError('');
        setSuccessMessage('');
        setIsBooking(gigId);

        try {
            // Using Axios to handle the booking request
            const response = await createBooking(gigId);
            const data = response.data;
            
            setSuccessMessage(`Booking confirmed! Reference: ${data.booking.paymentReference}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to process booking.');
        } finally {
            setIsBooking(null);
        }
    };

    const handleLogout = () => {
        if (authContext) authContext.logout();
        navigate('/login');
    };

    const styles = {
        container: { padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px' },
        title: { color: '#111827', fontSize: '28px', fontWeight: 'bold', margin: 0 },
        brandBlue: { color: '#2563eb' },
        logoutBtn: { padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
        gigItem: { padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' },
        bookBtn: { padding: '10px 20px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s', minWidth: '120px' },
        disabledBtn: { padding: '10px 20px', backgroundColor: '#9ca3af', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'not-allowed', minWidth: '120px' },
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>Loading Marketplace...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Client <span style={styles.brandBlue}>Dashboard</span></h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
            </div>

            <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '30px' }}>
                Browse available service offerings from our top freelancers.
            </p>

            {/* Centralized notification system for bookings */}
            {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '25px', fontWeight: '500' }}>{error}</div>}
            {successMessage && <div style={{ padding: '15px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '25px', fontWeight: '500' }}>{successMessage}</div>}

            {gigs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>No service offerings are currently available. Check back soon!</p>
                </div>
            ) : (
                gigs.map((gig) => {
                    const idToUse = gig._id || gig.id || '';
                    return (
                        <div key={idToUse} style={styles.gigItem}>
                            <div style={{ flex: 1, paddingRight: '20px' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#111827' }}>{gig.title}</h3>
                                <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '15px', lineHeight: '1.5' }}>{gig.description}</p>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                        {gig.category}
                                    </span>
                                    <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '18px' }}>
                                        R {gig.price.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <button 
                                    onClick={() => handleBookGig(idToUse)} 
                                    disabled={isBooking === idToUse}
                                    style={isBooking === idToUse ? styles.disabledBtn : styles.bookBtn}
                                >
                                    {isBooking === idToUse ? 'Processing...' : 'Book Gig'}
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ClientDashboard;

/* 
Reference List

Meta Platforms, Inc., 2026a. useContext (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useContext > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026b. useState (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 08 October 2026]
Meta Platforms, Inc., 2026c. useEffect (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useEffect > [Accessed 08 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 08 October 2026]
Remix Software, 2026. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 08 October 2026]
*/