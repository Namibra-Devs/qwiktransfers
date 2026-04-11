import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GlobalNotice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await api.get('/announcements');
            setNotices(res.data);
        } catch (error) {
            console.error('Failed to fetch global notices');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id) => {
        try {
            await api.post(`/announcements/${id}/dismiss`);
            setNotices(notices.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to dismiss notice');
        }
    };

    if (loading || notices.length === 0) return null;

    return (
        <div className="global-notices-container" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.map((notice) => (
                <div 
                    key={notice.id} 
                    className={`notice-banner notice-${notice.type}`}
                    style={{
                        padding: '16px 24px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        position: 'relative',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        animation: 'slideDown 0.4s ease-out',
                        background: notice.type === 'urgent' ? '#fff1f0' : notice.type === 'warning' ? '#fffbe6' : notice.type === 'success' ? '#f6ffed' : '#e6f7ff'
                    }}
                >
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: notice.type === 'urgent' ? '#ff4d4f' : notice.type === 'warning' ? '#faad14' : notice.type === 'success' ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                    }}>
                        <span className="material-symbols-outlined">
                            {notice.type === 'urgent' ? 'priority_high' : notice.type === 'warning' ? 'warning' : notice.type === 'success' ? 'check_circle' : 'campaign'}
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            fontWeight: 800, 
                            fontSize: '0.95rem', 
                            color: notice.type === 'urgent' ? '#820014' : notice.type === 'warning' ? '#874d00' : notice.type === 'success' ? '#135200' : '#003a8c',
                            marginBottom: '2px'
                        }}>
                            {notice.title}
                        </div>
                        <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'rgba(0,0,0,0.65)',
                            lineHeight: '1.4'
                        }}>
                            {notice.message}
                        </div>
                    </div>

                    <button 
                        onClick={() => handleDismiss(notice.id)}
                        style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'rgba(0,0,0,0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'rgba(0,0,0,0.4)'; }}
                        title="Dismiss announcement"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                    </button>
                </div>
            ))}

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .notice-urgent { border-left: 5px solid #ff4d4f !important; }
                .notice-warning { border-left: 5px solid #faad14 !important; }
                .notice-success { border-left: 5px solid #52c41a !important; }
                .notice-info { border-left: 5px solid #1890ff !important; }
            `}</style>
        </div>
    );
};

export default GlobalNotice;
