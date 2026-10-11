import { useState, useEffect, useContext } from 'react';
// The useNavigate hook handles secure redirection for unauthenticated or logged-out users (Remix Software, 2026a).
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Defining the interfaces for the data structures from the Admin endpoints (Microsoft, 2026).
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Transaction {
    _id: string;
    gigTitle: string;
    clientName: string;
    freelancerName: string;
    amount: number;
    date: string;
}

const AdminDashboard = () => {
    // State arrays to hold data for administrative oversight (Meta Platforms, Inc., 2026a).
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetches administrative data as soon as the dashboard renders (Meta Platforms, Inc., 2026b).
    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try 
        {
            // ednpoints to be implemented in the backend
            // Fetches all users and transactions from admin-only backend routes (Mozilla, 2026).
            const [usersRes, transRes] = await Promise.all([
                fetch('https://localhost:5000/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${authContext?.token}` }
                }),
                fetch('https://localhost:5000/api/admin/transactions', {
                    headers: { 'Authorization': `Bearer ${authContext?.token}` }
                })
            ]);

            if (!usersRes.ok || !transRes.ok) {
                throw new Error('Failed to fetch administrative data. Ensure backend controllers are active.');
            }

            const usersData = await usersRes.json();
            const transData = await transRes.json();

            setUsers(usersData);
            setTransactions(transData);
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

    const handleLogout = () => {
        if (authContext) authContext.logout();
        navigate('/login');
    };

    const styles = {
        container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f3f4f6' },
        title: { color: '#111827', fontSize: '28px', fontWeight: 'bold', margin: 0 },
        brandBlue: { color: '#2563eb' },
        logoutBtn: { padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
        section: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', marginBottom: '30px' },
        table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
        th: { padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151', fontWeight: 'bold' },
        td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>System <span style={styles.brandBlue}>Admin</span></h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
            </div>

            {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

            {isLoading ? (
                <p>Loading platform analytics...</p>
            ) : (
                <>
                    <div style={styles.section}>
                        <h2 style={{ marginTop: 0, color: '#1f2937' }}>Platform Users ({users.length})</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td style={styles.td}>{user.name}</td>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: user.role === 'Admin' ? '#fef08a' : '#dbeafe', color: user.role === 'Admin' ? '#854d0e' : '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.section}>
                        <h2 style={{ marginTop: 0, color: '#1f2937' }}>Recent Transactions</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Gig Title</th>
                                    <th style={styles.th}>Client</th>
                                    <th style={styles.th}>Freelancer</th>
                                    <th style={styles.th}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx._id}>
                                        <td style={styles.td}>{tx.gigTitle}</td>
                                        <td style={styles.td}>{tx.clientName}</td>
                                        <td style={styles.td}>{tx.freelancerName}</td>
                                        <td style={{...styles.td, color: '#10b981', fontWeight: 'bold'}}>R {tx.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;

/* 
Reference List

Meta Platforms, Inc., 2026a. useState (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useState > [Accessed 09 October 2026]
Meta Platforms, Inc., 2026b. useEffect (Version 18.2) [Source Code] Available at: < https://react.dev/reference/react/useEffect > [Accessed 09 October 2026]
Microsoft, 2026. TypeScript Interfaces (Version 5.0) [Source Code] Available at: < https://www.typescriptlang.org/docs/handbook/interfaces.html > [Accessed 09 October 2026]
Mozilla, 2026. Using the Fetch API (Version 1.0) [online] Available at: < https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch > [Accessed 09 October 2026]
Remix Software, 2026a. useNavigate (Version 6.22) [Source Code] Available at: < https://reactrouter.com/en/main/hooks/use-navigate > [Accessed 09 October 2026]
*/