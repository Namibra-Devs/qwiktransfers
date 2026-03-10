import React, { useEffect } from 'react';
import api from '../services/api';

const SystemBrandingManager = () => {
    useEffect(() => {
        applyBranding();
        window.addEventListener('system-config-updated', applyBranding);
        return () => window.removeEventListener('system-config-updated', applyBranding);
    }, []);

    const applyBranding = async () => {
        try {
            const res = await api.get('/system/config/public');
            const { system_name, system_logo } = res.data;

            // Update Title
            if (system_name) {
                document.title = system_name;
            } else {
                document.title = 'QWIK Transfers'; // Default fallback
            }

            // Update Favicon
            if (system_logo) {
                updateFavicon(`${import.meta.env.VITE_API_URL}/${system_logo}`);
            }
        } catch (error) {
            console.error('Failed to apply system branding:', error);
        }
    };

    const updateFavicon = (url) => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = url;
    };

    return null; // This component doesn't render anything
};

export default SystemBrandingManager;
