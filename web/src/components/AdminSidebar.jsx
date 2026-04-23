import React from 'react';
import api from '../services/api';
import NotificationPanel from './NotificationPanel';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab, logout, isOpen, toggleSidebar }) => {
    const { user } = useAuth();
    const [systemLogo, setSystemLogo] = React.useState(null);
    const [systemName, setSystemName] = React.useState('QWIK Admin');
    const [pendingCounts, setPendingCounts] = React.useState({ kyc: 0, inquiries: 0 });

    React.useEffect(() => {
        fetchSystemLogo();
        fetchPendingCounts();
        window.addEventListener('system-config-updated', fetchSystemLogo);
        
        // Refresh counts every 30 seconds
        const countInterval = setInterval(fetchPendingCounts, 30000);
        
        return () => {
            window.removeEventListener('system-config-updated', fetchSystemLogo);
            clearInterval(countInterval);
        };
    }, []);

    const fetchPendingCounts = async () => {
        try {
            const [kycRes, inquiryRes] = await Promise.all([
                api.get('/auth/users?role=user&kycStatus=pending&limit=1'),
                api.get('/support/inquiries?status=pending&limit=1')
            ]);
            setPendingCounts({
                kyc: kycRes.data.total || 0,
                inquiries: inquiryRes.data.total || 0
            });
        } catch (error) {
            console.error('Failed to fetch pending counts');
        }
    };

    const fetchSystemLogo = async () => {
        try {
            const res = await api.get('/system/config');
            if (res.data.system_logo) {
                setSystemLogo(`${import.meta.env.VITE_API_URL}/${res.data.system_logo}`);
            }
            if (res.data.system_name) {
                setSystemName(res.data.system_name);
            }
        } catch (error) {
            console.error('Failed to fetch system logo');
        }
    };

    const menuItems = [
        { id: 'analytics', label: 'Analytics', icon: 'trending_up' },
        { id: 'transactions', label: 'Transactions', icon: 'bar_chart' },
        { id: 'kyc', label: 'KYC Review', icon: 'id_card', badge: pendingCounts.kyc },
        { id: 'inquiries', label: 'Support Inquiries', icon: 'mail', badge: pendingCounts.inquiries },
        { id: 'complaints', label: 'User Complaints', icon: 'warning' },
        { id: 'users', label: 'Users', icon: 'group' },
        { id: 'vendors', label: 'Vendors', icon: 'corporate_fare' },
        ...(user?.sub_role === 'super' ? [
            { id: 'admins', label: 'Administrative Staff', icon: 'admin_panel_settings' },
            { id: 'announcements', label: 'Global Broadcasts', icon: 'campaign' },
            { id: 'audit', label: 'Audit Logs', icon: 'history' },
            { id: 'system-settings', label: 'System Settings', icon: 'settings' },
            { id: 'payment-settings', label: 'Payment Settings', icon: 'payments' }
        ] : []),
        { id: 'profile', label: 'Profile', icon: 'account_circle' },
        { id: 'help', label: 'Help Center', icon: 'help_outline' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'var(--card-bg)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                <Link to="/admin" style={{ padding: '24px', display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none' }}>
                    {systemLogo ? (
                        <img src={systemLogo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>language</span>
                    )}
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', margin: 0 }}>{systemName}</h1>
                </Link>
            </div>

            <nav style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge > 0 && (
                            <span style={{ 
                                background: activeTab === item.id ? '#fff' : 'var(--primary)', 
                                color: activeTab === item.id ? 'var(--primary)' : '#fff',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        color: 'var(--danger)',
                        borderRadius: '30px',
                        border: '2px solid var(--danger)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
