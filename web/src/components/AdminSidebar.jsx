import React from 'react';
import api from '../services/api';
import NotificationPanel from './NotificationPanel';
import ThemeSwitcher from './ThemeSwitcher';

const AdminSidebar = ({ activeTab, setActiveTab, logout, isOpen, toggleSidebar }) => {
    const [systemLogo, setSystemLogo] = React.useState(null);
    const [systemName, setSystemName] = React.useState('QWIK Admin');

    React.useEffect(() => {
        fetchSystemLogo();
        window.addEventListener('system-config-updated', fetchSystemLogo);
        return () => window.removeEventListener('system-config-updated', fetchSystemLogo);
    }, []);

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
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'transactions', label: 'Transactions', icon: '📊' },
        { id: 'kyc', label: 'KYC Review', icon: '🆔' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'vendors', label: 'Vendors', icon: '🏢' },
        { id: 'audit', label: 'Audit Logs', icon: '📜' },
        { id: 'system-settings', label: 'System Settings', icon: '⚙️' },
        { id: 'payment-settings', label: 'Payment Settings', icon: '💳' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'help', label: 'Help Center', icon: '❓' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'var(--card-bg)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                {systemLogo ? (
                    <img src={systemLogo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                ) : (
                    <span style={{ fontSize: '1.5rem' }}>🌍</span>
                )}
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', margin: 0 }}>QWIK Admin</h1>
            </div>

            <nav style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        {item.label}
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
                    <span style={{ fontSize: '1.1rem' }}>🚪</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
