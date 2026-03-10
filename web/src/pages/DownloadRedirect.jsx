import React, { useEffect } from 'react';

const DownloadRedirect = () => {
    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            window.location.href = "https://apps.apple.com/app/qwiktransfers"; // Replace with real link
        }
        // Android detection
        else if (/android/i.test(userAgent)) {
            window.location.href = "https://play.google.com/store/apps/details?id=com.qwiktransfers"; // Replace with real link
        }
        // Fallback for desktop or others
        else {
            window.location.href = "/";
        }
    }, []);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            color: '#212121'
        }}>
            <h2>Redirecting to App Store...</h2>
        </div>
    );
};

export default DownloadRedirect;
