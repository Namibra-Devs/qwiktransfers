import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const LandingLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [systemName, setSystemName] = useState('Qwiktransfers');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRes = await api.get('/system/config/public');
                if (configRes.data.system_name) {
                    setSystemName(configRes.data.system_name);
                }
            } catch (error) {
                console.error('Config fetch error:', error);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="landing-layout">
            {/* Chowdeck Style Segmented Navbar */}
            <nav className="landing-navbar">
                {/* Segment 1: Brand */}
                <div className="nav-segment nav-brand-pill">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>Q</div>
                        <span>{systemName}</span>
                    </Link>
                </div>

                {/* Segment 2: Links */}
                <div className="nav-segment nav-links-pill">
                    <a href="/#how-it-works" className="nav-link">Movement</a>
                    <Link to="/about-vendor" className="nav-link">Vendors</Link>
                    <Link to="/contact-us" className="nav-link">Help</Link>
                </div>

                {/* Segment 3: Auth/CTAs */}
                <div className="nav-segment nav-auth-pill">
                    <Link to="/login" className="btn-pill-secondary">Log in</Link>
                    <Link to="/register" className="btn-pill-primary">Join Now</Link>
                </div>

                {/* Mobile Trigger */}
                <button className="nav-mobile-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                    <Link to="/" className="giant-heading" style={{ fontSize: '2.5rem' }} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/about-vendor" className="giant-heading" style={{ fontSize: '2.5rem' }} onClick={() => setIsMenuOpen(false)}>Vendors</Link>
                    <Link to="/contact-us" className="giant-heading" style={{ fontSize: '2.5rem' }} onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
                    <Link to="/login" className="btn-primary" style={{ width: '240px' }} onClick={() => setIsMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="btn-secondary" style={{ width: '240px', background: 'var(--secondary)', color: 'white' }} onClick={() => setIsMenuOpen(false)}>Join Now</Link>
                </div>
            )}

            <main>
                {children}
            </main>

            {/* Minimalist Giant Text Footer (Image 2 Style) */}
            <footer className="minimal-giant-footer">
                <div className="footer-top-row">
                    <span>©{new Date().getFullYear()} All rights reserved</span>
                    <span>info@qwiktransfers.com</span>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                </div>
                <div className="footer-giant-brand">
                    Qwiktransfers
                </div>
            </footer>

            {/* Global Floating QR Pill */}
            <div className="global-floating-qr">
                <div
                    className="qr-pill"
                    onClick={() => window.location.href = '/download'}
                >
                    <img
                        src="/qwiktransfers_qr.png"
                        alt="QR Code"
                        className="qr-code-img"
                    />
                    <span className="qr-text">Get the app</span>
                </div>
            </div>
        </div>
    );
};

export default LandingLayout;
