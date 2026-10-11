import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface Gig {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
}

interface Booking {
    _id: string;
    gig: { title: string };
    client: { name: string; email: string };
    amount: number;
    paymentReference: string;
}

const FreelancerDashboard = () => {
    // Managing local state for CRUD operations (Meta Platforms, Inc., 2026a).
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Added state to track which gig is being deleted to show the custom modal (Meta Platforms, Inc., 2026a).
    const [gigToDelete, setGigToDelete] = useState<string | null>(null);

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFreelancerData();
    }, []);

    const fetchFreelancerData = async () => {
        try {
            // Concurrent fetching for both active gigs and incoming bookings (Mozilla, 2026).
            const [gigsRes, bookingsRes] = await Promise.all([
                fetch('https://localhost:5000/api/gigs', {
                    headers: { 'Authorization': `Bearer ${authContext?.token}` }
                }),
                fetch('https://localhost:5000/api/bookings/income', {
                    headers: { 'Authorization': `Bearer ${authContext?.token}` }
                })
            ]);

            if (gigsRes.ok) {
                const gigsData = await gigsRes.json();
                
                const allGigs = gigsData.gigs || [];
                
                // Securely decode the JWT payload to get the user ID without relying on AuthContext types (Mozilla, 2026).
                let userId = '';
                if (authContext?.token) {
                    const payload = JSON.parse(atob(authContext.token.split('.')[1]));
                    userId = payload.id;
                }

                // Filter the global list to only show gigs matching this freelancer's ID
                const myGigs = allGigs.filter((g: any) => {
                    const freelancerId = g.freelancer?._id || g.freelancer?.id || g.freelancer;
                    return freelancerId === userId;
                });
                
                setGigs(myGigs);
            }

            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setTotalIncome(bookingsData.totalIncome || 0);
                setBookings(bookingsData.bookings || []);
            }
        } catch (err: any) {
            console.error('Failed to fetch freelancer data');
        }
    };

    // Submits the form data to create a new gig in the database (Mozilla, 2026).
    const handleCreateGig = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('https://localhost:5000/api/gigs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authContext?.token}`
                },
                body: JSON.stringify({ title, description, price: Number(price), category })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create gig.');

            setSuccessMessage('Gig published successfully!');
            setTitle(''); setDescription(''); setPrice(''); setCategory('');
            fetchFreelancerData(); 
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRequest = (gigId: string) => {
        setGigToDelete(gigId);
    };

    const confirmDeleteGig = async () => {
        if (!gigToDelete) return;
        
        try {
            const response = await fetch(`https://localhost:5000/api/gigs/${gigToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authContext?.token}` }
            });
            if (!response.ok) throw new Error('Failed to delete gig.');
            
            setGigToDelete(null); // Close the modal on success
            fetchFreelancerData(); 
        } catch (err: any) {
            setError(err.message);
            setGigToDelete(null);
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
        card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', marginBottom: '30px' },
        input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' as const, backgroundColor: '#f9fafb', color: '#111827', fontSize: '15px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' },
        incomeBox: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '24px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' as const },
        incomeValue: { fontSize: '32px', fontWeight: 'bold', color: '#1e40af', margin: '10px 0 0 0' },
        gigItem: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' },
        actionBtn: { padding: '8px 12px', marginLeft: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: '600' },
        table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
        th: { padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151', fontWeight: 'bold' },
        td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' },

        // Our custom modal overlay styles (W3C, 2026).
        modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
        modalTitle: { margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' },
        modalText: { margin: '0 0 20px 0', color: '#4b5563', fontSize: '14px' },
        modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
        modalCancelBtn: { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
        modalConfirmBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Freelancer <span style={styles.brandBlue}>Dashboard</span></h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
            </div>

            <div style={styles.incomeBox}>
                <h3 style={{ margin: 0, color: '#3b82f6' }}>Total Tracked Income</h3>
                <p style={styles.incomeValue}>R {totalIncome.toFixed(2)}</p>
            </div>

            <div style={styles.card}>
                <h3 style={{ marginTop: 0, color: '#1f2937' }}>Create a New Service Offering</h3>
                {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}
                {successMessage && <div style={{ padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '15px' }}>{successMessage}</div>}

                <form onSubmit={handleCreateGig}>
                    <input type="text" placeholder="Gig Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={styles.input} />
                    <textarea placeholder="Service Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{...styles.input, height: '100px', resize: 'vertical'}} />
                    <input type="text" placeholder="Category (e.g. Web Development)" value={category} onChange={(e) => setCategory(e.target.value)} required style={styles.input} />
                    <input type="number" placeholder="Price (ZAR)" value={price} onChange={(e) => setPrice(e.target.value)} required style={styles.input} />
                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Publishing...' : 'Publish Gig'}
                    </button>
                </form>
            </div>

            <h3 style={{ color: '#374151', marginBottom: '15px' }}>My Active Gigs ({gigs.length})</h3>
            {gigs.map((gig) => (
                <div key={gig._id} style={styles.gigItem}>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#111827' }}>{gig.title}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>{gig.description}</p>
                        <span style={{ fontWeight: 'bold', color: '#2563eb' }}>R {gig.price.toFixed(2)}</span>
                    </div>
                    <div>
                        <button onClick={() => navigate('/edit-gig/' + gig._id)} style={{...styles.actionBtn, backgroundColor: '#f3f4f6', color: '#4b5563'}}>Edit</button>
                        <button onClick={() => handleDeleteRequest(gig._id)} style={{...styles.actionBtn, backgroundColor: '#fee2e2', color: '#ef4444'}}>Delete</button>
                    </div>
                </div>
            ))}

            <div style={{ ...styles.card, marginTop: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#1f2937' }}>Recent Client Bookings</h3>
                {bookings.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>No bookings received yet.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Service Reference</th>
                                <th style={styles.th}>Client Details</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Payment Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking._id}>
                                    <td style={styles.td}>{booking.gig?.title || 'Service Offering'}</td>
                                    <td style={styles.td}>
                                        <div style={{ color: '#111827', fontWeight: '500' }}>
                                            {booking.client?.name || 'Unknown Client'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                            {booking.client?.email || ''}
                                        </div>
                                    </td>
                                    <td style={{...styles.td, color: '#10b981', fontWeight: 'bold'}}>R {booking.amount.toFixed(2)}</td>
                                    <td style={styles.td}>{booking.paymentReference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {gigToDelete && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <h3 style={styles.modalTitle}>Delete Service Offering</h3>
                        <p style={styles.modalText}>Are you sure you want to delete this gig? This action cannot be undone.</p>
                        <div style={styles.modalActions}>
                            <button onClick={() => setGigToDelete(null)} style={styles.modalCancelBtn}>Cancel</button>
                            <button onClick={confirmDeleteGig} style={styles.modalConfirmBtn}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreelancerDashboard;

/* 
Reference List

Meta Platforms, Inc., 2026a. useState Hook (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 08 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 08 October 2026]
Remix Software, 2026. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 08 October 2026]
*/