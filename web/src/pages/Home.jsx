import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [rate, setRate] = useState(null);
    const [systemName, setSystemName] = useState('Qwiktransfers');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rateRes, configRes] = await Promise.all([
                    api.get('/rates'),
                    api.get('/system/config/public')
                ]);
                setRate(rateRes.data.rate);
                if (configRes.data.system_name) {
                    setSystemName(configRes.data.system_name);
                }
            } catch (error) {
                console.error('Landing page fetch error:', error);
            }
        };
        fetchData();
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="landing-layout">
            {/* Chowdeck Style Segmented Navbar */}
            <nav className="landing-navbar">
                {/* Segment 1: Brand */}
                <div className="nav-segment nav-brand-pill">
                    <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>Q</div>
                    <span>{systemName}</span>
                </div>

                {/* Segment 2: Links */}
                <div className="nav-segment nav-links-pill">
                    <a href="#how-it-works" className="nav-link">Movement</a>
                    <Link to="/vendors" className="nav-link">Vendors</Link>
                    <Link to="/help" className="nav-link">Help</Link>
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
                    <Link to="/vendors" className="giant-heading" style={{ fontSize: '2.5rem' }} onClick={() => setIsMenuOpen(false)}>Vendors</Link>
                    <a href="#how-it-works" className="giant-heading" style={{ fontSize: '2.5rem' }} onClick={() => setIsMenuOpen(false)}>How it works</a>
                    <Link to="/login" className="btn-primary" style={{ width: '240px' }} onClick={() => setIsMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="btn-secondary" style={{ width: '240px', background: 'var(--secondary)', color: 'white' }} onClick={() => setIsMenuOpen(false)}>Join Now</Link>
                </div>
            )}

            {/* Hero Section */}
            <section className="section-padding content-grid" style={{ minHeight: '100vh', paddingTop: '160px', position: 'relative', backgroundImage: "url('/bg-1.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="hero-text">
                    <span className="bold-tag">Trusted by 50,000+ Families</span>
                    <h1 className="giant-heading">Send Money Home, <span style={{ color: 'var(--primary)' }}>Fast.</span></h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: '32px 0 48px', maxWidth: '480px' }}>
                        The most reliable way to send money between Canada and Ghana. High rates, zero hidden fees, and lightning speed.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link to="/register" className="btn-primary" style={{ width: 'auto', padding: '16px 40px', fontSize: '1.1rem' }}>Get Started Now</Link>
                        <a href="#how-it-works" className="btn-outline" style={{ width: 'auto', padding: '16px 40px', fontSize: '1.1rem' }}>See How It Works</a>
                    </div>
                </div>
                <div className="hero-image" style={{ position: 'relative' }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '40px', overflow: 'hidden', border: '4px solid #FADED9', boxShadow: '20px 20px 0 var(--primary)' }}>
                        <img
                            src="https://images.pexels.com/photos/8525014/pexels-photo-8525014.jpeg?_gl=1*blnhka*_ga*MTk0NzczMjg1MC4xNzY1ODUwNDg4*_ga_8JE65Q40S6*czE3NzI5NDk0ODckbzMkZzEkdDE3NzI5NDk3NDQkajI1JGwwJGgw"
                            alt="Happy family"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </section>

            {/* PayPal Style "Send Smarter" Impact Section */}
            <section className="send-smarter-section">
                <div className="giant-text-container">
                    <h1 className="giant-text top">send</h1>
                    <h1 className="giant-text bottom">smarter</h1>
                </div>

                {/* Smart QR Code Pill */}
                <div className="impact-qr-container">
                    <div
                        className="qr-pill"
                        onClick={() => window.location.href = '/download'}
                    >
                        <img
                            src="/qwiktransfers_qr.png"
                            alt="QR Code"
                            className="qr-code-img"
                        />
                        <span className="qr-text">Get the Qwiktransfers app</span>
                    </div>
                </div>
            </section>

            {/* Global Pulse Converter */}
            <section className="pulse-section">
                <div className="pulse-label left">CANADA</div>
                <div className="pulse-label right">GHANA</div>

                <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '16px' }}>Moving at the Speed of Life</h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px' }}>
                    Experience real-time heartbeat of the Canada-Ghana financial corridor.
                </p>

                <div className="pulse-globe-container">
                    <div className="symbolic-globe"></div>

                    <div className="conversion-pill-overlay">
                        <div className="pill-currency-tag">
                            <span style={{ fontSize: '1.8rem' }}>🇨🇦</span>
                            <span>1 CAD</span>
                        </div>
                        <div className="pill-arrow">→</div>
                        <div className="pill-rate-display">
                            <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🇬🇭</span>
                            {rate ? `${rate} GHS` : 'Calculating...'}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '60px', display: 'flex', gap: '32px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>$0.00</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Hidden Fees</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Instant</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Payout Speed</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Bank-Grade</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Security</div>
                    </div>
                </div>
            </section>

            {/* Live Pulse Ticker */}
            <div className="ticker-wrap">
                <div className="ticker-content">
                    • 🇨🇦 CANADA TO GHANA 🇬🇭 INSTANT SETTLEMENT • LOWEST FEES GUARANTEED • REAL-TIME TRACKING • BANK-LEVEL SECURITY • NO HIDDEN CHARGES • GHANA'S MOST TRUSTED PARTNER •
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    • 🇨🇦 CANADA TO GHANA 🇬🇭 INSTANT SETTLEMENT • LOWEST FEES GUARANTEED • REAL-TIME TRACKING • BANK-LEVEL SECURITY • NO HIDDEN CHARGES • GHANA'S MOST TRUSTED PARTNER •
                </div>
            </div>

            {/* How It Works */}
            <section id="how-it-works" className="section-padding" style={{ background: 'var(--bg-peach)' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>Mission in 3 Simple Steps</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No complexity. Just pure movement.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <div className="sticker-card" style={{ background: 'white' }}>
                        <div style={{ width: '64px', height: '64px', background: '#FADED9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>🛡️</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>1. Secure Connection</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Sign up in seconds and complete our simple identity check to keep your funds safe.</p>
                    </div>
                    <div className="sticker-card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>💸</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>2. Send Anywhere</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Enter the amount, select your recipient, and pay via Interac e-Transfer or Bank Transfer.</p>
                    </div>
                    <div className="sticker-card" style={{ background: 'white' }}>
                        <div style={{ width: '64px', height: '64px', background: '#DFF6DD', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>🎉</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>3. Instant Payout</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Funds land instantly in Ghana via Mobile Money (MTN, Vodafone, AirtelTigo) or Bank Account.</p>
                    </div>
                </div>
            </section>

            {/* Success Wall */}
            <section className="section-padding" style={{ background: 'white' }}>
                <div className="content-grid">
                    <div className="hero-image">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="sticker-card">
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--pulse-green)' }}>✓ SUCCESS</div>
                                <div style={{ fontStyle: 'italic', margin: '8px 0' }}>"Sent GH₵2.5k to Kumasi instantly."</div>
                                <div style={{ fontWeight: 700 }}>A. Boateng</div>
                            </div>
                            <div className="sticker-card" style={{ marginTop: '40px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--pulse-green)' }}>✓ SUCCESS</div>
                                <div style={{ fontStyle: 'italic', margin: '8px 0' }}>"Best rates I've found in Toronto."</div>
                                <div style={{ fontWeight: 700 }}>J. Mensah</div>
                            </div>
                            <div className="sticker-card" style={{ alignSelf: 'start' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--pulse-green)' }}>✓ SUCCESS</div>
                                <div style={{ fontStyle: 'italic', margin: '8px 0' }}>"Support team is elite!"</div>
                                <div style={{ fontWeight: 700 }}>K. Asare</div>
                            </div>
                            <div className="sticker-card" style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--pulse-green)' }}>✓ SUCCESS</div>
                                <div style={{ fontStyle: 'italic', margin: '8px 0' }}>"Zero hidden charges as promised."</div>
                                <div style={{ fontWeight: 700 }}>M. Osei</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>Movement in Numbers</h2>
                        <div style={{ display: 'grid', gap: '24px', marginTop: '40px' }}>
                            <div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>$20M+</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Transferred Yearly</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--pulse-green)' }}>99.9%</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Success Rate</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--secondary)' }}>Instant</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Payout Speed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="section-padding" style={{ background: 'var(--secondary)', color: 'white', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '24px' }}>Ready to make your move?</h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
                    Join thousands of Ghanaians and Canadians who trust Qwiktransfers for their daily financial movements.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/register" className="btn-primary" style={{ border: 'none', background: 'white', color: 'var(--secondary)', width: 'auto', padding: '16px 48px', fontSize: '1.1rem' }}>Create Free Account</Link>
                </div>
                <div style={{ marginTop: '100px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ opacity: 0.5 }}>© {new Date().getFullYear()} {systemName}. Licensed and Secure.</span>
                    <div style={{ display: 'flex', gap: '24px', opacity: 0.5 }}>
                        <Link to="#" style={{ color: 'white' }}>Terms</Link>
                        <Link to="#" style={{ color: 'white' }}>Privacy</Link>
                        <Link to="#" style={{ color: 'white' }}>Help</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
