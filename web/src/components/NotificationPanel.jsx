import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/system/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        // Listen for internal refresh requests
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refresh-notifications', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refresh-notifications', handleRefresh);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/system/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/system/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={panelRef}>
            <div
                onClick={() => setShowPanel(!showPanel)}
                style={{ position: 'relative', cursor: 'pointer', padding: '8px', color: 'var(--text-deep-brown)' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', opacity: 0.8 }}>notifications</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--danger)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 5px',
                        borderRadius: '10px',
                        border: '2px solid var(--card-bg)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {showPanel && (
                <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: '0',
                    width: '320px',
                    maxHeight: '400px',
                    background: 'var(--card-bg)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={async () => {
                                        if (!notification.isRead) {
                                            await markAsRead(notification.id);
                                        }
                                        if (notification.link) {
                                            navigate(notification.link);
                                            setShowPanel(false);
                                        }
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: notification.isRead ? 'transparent' : 'rgba(216, 172, 143, 0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4', flex: 1 }}>{notification.message}</div>
                                        {notification.link && (
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)', opacity: 0.7 }}>open_in_new</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
