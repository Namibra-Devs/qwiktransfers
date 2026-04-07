import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ConnectivityManager = () => {
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Back Online!', {
                duration: 4000,
                position: 'top-center',
                icon: <span className="material-symbols-outlined" style={{ color: '#fff' }}>public</span>,
                style: {
                    borderRadius: '12px',
                    background: '#22c55e',
                    color: '#fff',
                    fontWeight: 700
                },
            });
            // Hide banner after a short delay when back online
            setTimeout(() => setShowBanner(false), 1000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!window.navigator.onLine) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div className={`connectivity-banner ${!isOnline ? 'offline' : 'online-restoring'}`}>
            <div className="connectivity-content">
                <span className="material-symbols-outlined connectivity-icon" style={{ fontSize: '1.5rem' }}>
                    {!isOnline ? 'cloud_off' : 'check_circle'}
                </span>
                <div className="connectivity-text">
                    <span className="connectivity-title">
                        {!isOnline ? 'No Internet Connection' : 'Connection Restored'}
                    </span>
                    <span className="connectivity-subtitle">
                        {!isOnline ? 'Please check your network settings. Some features may be limited.' : 'Resuming real-time updates.'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ConnectivityManager;
