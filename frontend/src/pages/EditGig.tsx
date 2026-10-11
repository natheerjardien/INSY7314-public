import React, { useState, useEffect, useContext } from 'react';
// useParams allows us to extract the gig ID from the URL string to fetch the correct data (Remix Software, 2026b).
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EditGig = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    // State bindings for the form inputs (Meta Platforms, Inc., 2026a).
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetches the existing gig data to populate the form on load (Meta Platforms, Inc., 2026b).
    useEffect(() => {
        const fetchGigDetails = async () => {
            try 
            {
                const response = await fetch(`https://localhost:5000/api/gigs/${id}`, {
                    headers: { 'Authorization': `Bearer ${authContext?.token}` }
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'Failed to load gig details.');

                setTitle(data.title);
                setDescription(data.description);
                setPrice(data.price.toString());
            } 
            catch (err: any) 
            {
                setError(err.message);
            } 
            finally 
            {
                setIsLoading(false);
            }
        };

        fetchGigDetails();
    }, [id, authContext?.token]);

    // Handles the PUT request to update the resource in the backend (Mozilla, 2026).
    const handleUpdateGig = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try 
        {
            const response = await fetch(`https://localhost:5000/api/gigs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authContext?.token}`
                },
                body: JSON.stringify({ title, description, price: Number(price) })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update gig.');

            // Navigates back to the freelancer dashboard when the update is successful (Remix Software, 2026a).
            navigate('/freelancer-dashboard');
        } 
        catch (err: any) 
        {
            setError(err.message);
            setIsSaving(false);
        }
    };

    const styles = {
        container: { padding: '40px', maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial, sans-serif' },
        card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' },
        title: { color: '#111827', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 },
        input: { 
            width: '100%', 
            padding: '12px', 
            marginBottom: '15px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            boxSizing: 'border-box' as const, 
            backgroundColor: '#f9fafb', 
            fontSize: '15px',
            color: '#111827', // Ensures text is highly readable (W3C, 2026b).
            fontFamily: 'inherit' // Forces the textarea to use the same sans-serif font as the rest of the app (W3C, 2026a).
        },
        buttonRow: { display: 'flex', gap: '10px', marginTop: '10px' },
        saveBtn: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },
        cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>Loading gig details...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Update Service Offering</h2>
                
                {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleUpdateGig}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>Gig Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={styles.input} />
                    
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required style={{...styles.input, height: '120px', resize: 'vertical'}} />
                    
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>Price (ZAR)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={styles.input} />
                    
                    <div style={styles.buttonRow}>
                        <button type="button" onClick={() => navigate('/freelancer-dashboard')} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isSaving} style={{...styles.saveBtn, opacity: isSaving ? 0.7 : 1}}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGig;

/* 
Reference List

Meta Platforms, Inc., 2026a. useState (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 09 October 2026]
Meta Platforms, Inc., 2026b. useEffect (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useEffect > [Accessed 09 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 09 October 2026]
Remix Software, 2026a. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 09 October 2026]
Remix Software, 2026b. useParams (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-params > [Accessed 09 October 2026]
W3C, 2026a. CSS Fonts Module Level 4. [online] Available at: < https://www.w3.org/TR/css-fonts-4/ > [Accessed 09 October 2026]
W3C, 2026b. Web Content Accessibility Guidelines (WCAG) 2.2. [online] Available at: < https://www.w3.org/TR/WCAG22/ > [Accessed 09 October 2026]
*/