import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LandingLayout from '../components/LandingLayout';

const FAQItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`faq-item ${isOpen ? 'active' : ''}`}>
            <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                {faq.q}
                <span className="faq-icon">+</span>
            </button>
            <div className="faq-answer">
                {faq.a}
            </div>
        </div>
    );
};

const RateCalculator = ({ rate }) => {
    const [sendAmount, setSendAmount] = useState('1000');

    // Calculate receive amount based on rate
    const receiveAmount = rate ? (parseFloat(sendAmount || 0) * rate).toFixed(2) : '0.00';

    const handleSendChange = (e) => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) {
            setSendAmount(val);
        }
    };

    return (
        <div className="calculator-widget">
            <div className="live-badge">
                <span className="pulse-indicator"></span>
                Live Market Rate
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--secondary)' }}>Check our live rates</h3>

            <div className="calc-input-group">
                <label>You send</label>
                <div className="calc-input-wrapper">
                    <input
                        type="text"
                        value={sendAmount}
                        onChange={handleSendChange}
                        className="calc-input"
                        placeholder="1000"
                    />
                    <div className="calc-currency">
                        <span className="flag">🇨🇦</span> CAD
                    </div>
                </div>
            </div>

            <div className="calc-divider">
                <div className="calc-divider-line"></div>
                <div className="calc-switch-btn">
                    ↓↑
                </div>
                <div className="calc-divider-line"></div>
            </div>

            <div className="calc-input-group">
                <label>Recipient gets</label>
                <div className="calc-input-wrapper">
                    <input
                        type="text"
                        value={receiveAmount}
                        readOnly
                        className="calc-input readonly"
                    />
                    <div className="calc-currency">
                        <span className="flag">🇬🇭</span> GHS
                    </div>
                </div>
            </div>

            <div className="calc-details">
                <div className="calc-detail-row">
                    <span>Exchange rate</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                        1 CAD = {rate ? rate : '--'} GHS
                    </span>
                </div>
                <div className="calc-detail-row">
                    <span>Transfer fee</span>
                    <span style={{ fontWeight: 600 }}>$0.00 CAD</span>
                </div>
            </div>

            <Link to="/register" className="btn-primary" style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '1.2rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Get Started
            </Link>
        </div>
    );
};

const Home = () => {
    const [rate, setRate] = useState(null);
    const [systemName, setSystemName] = useState('Qwiktransfers');
    const revealRefs = useRef([]);
    revealRefs.current = [];

    const addToRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rateRes, configRes] = await Promise.all([
                    api.get('/rates'),
                    api.get('/system/config/public')
                ]);
                const rawRate = rateRes.data.rate;
                const displayRate = rawRate < 1 ? (1 / rawRate) : rawRate;
                setRate(displayRate.toFixed(2));
                if (configRes.data.system_name) {
                    setSystemName(configRes.data.system_name);
                }
            } catch (error) {
                console.error('Landing page fetch error:', error);
            }
        };
        fetchData();

        // Reveal on scroll logic
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(ref => observer.observe(ref));

        return () => observer.disconnect();
    }, []);

    return (
        <LandingLayout>
            <div className="landing-layout-inner">

            {/* Editorial UI Hero Section */}
            <section className="hero-editorial-section reveal-on-scroll" id="hero" ref={addToRefs}>
                <div className="editorial-grid-bg">
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                </div>

                <div className="editorial-content-layer">
                    <div className="editorial-text-group">
                        <div className="text-layer-back">{systemName.toUpperCase()}</div>
                        <h1 className="text-layer-front signature-font">MAKE MONEY MOVE</h1>
                    </div>

                    <div className="editorial-cards-container">
                        <div className="floating-accent face-green"><span>☺</span></div>
                        <div className="floating-accent face-orange"><span>☺</span></div>

                        <div className="editorial-card card-success">
                            <div className="card-header">
                                <span className="icon">✓</span>
                                <strong>Payment Sent</strong>
                                <span className="view-link">View Receipt &gt;</span>
                            </div>
                            <div className="card-body">
                                <div className="amount-row">
                                    <span className="currency">🇨🇦 CAD</span>
                                    <span className="value">1,000.00</span>
                                </div>
                                <div className="transfer-path">
                                    <div className="dot"></div>
                                    <div className="line"></div>
                                    <div className="dot green"></div>
                                </div>
                                <div className="amount-row">
                                    <span className="currency">🇬🇭 GHS</span>
                                    <span className="value" style={{ color: 'var(--success)' }}>{rate ? (1000 * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="editorial-card card-rate">
                            <div className="card-header">
                                <span className="icon clock">⚡</span>
                                <strong>Live Market Rate</strong>
                            </div>
                            <div className="card-body">
                                <div className="rate-chart-mock">
                                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                                        <path d="M0,25 C20,10 40,30 60,15 C80,0 100,20 100,20 L100,30 L0,30 Z" fill="rgba(16, 124, 16, 0.1)" />
                                        <path d="M0,25 C20,10 40,30 60,15 C80,0 100,20 100,20" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="100" cy="20" r="3" fill="var(--primary)" />
                                    </svg>
                                </div>
                                <div className="rate-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: <strong>Locked</strong></span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 800 }}>1 CAD = {rate ? rate : '--'} GHS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="editorial-footer">
                        <p>Transforming cross-border payments with lightning-fast speeds and zero hidden fees.</p>
                        <div className="editorial-actions">
                            <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', width: 'auto', textDecoration: 'none' }}>Get Started Today</Link>
                            <a href="#how-it-works" className="btn-outline" style={{ padding: '16px 32px', width: 'auto', background: 'white', borderColor: 'var(--border-color)', color: 'var(--secondary)', textDecoration: 'none' }}>See How It Works</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Interactive Rate Calculator Section */}
            <section className="premium-calc-section reveal-on-scroll" id="calculator" ref={addToRefs}>
                <div className="editorial-grid-bg" style={{ opacity: 0.3 }}>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                </div>

                <div className="premium-calc-container">
                    <div className="premium-calc-header">
                        <h2 className="signature-font">Transparent Pricing, <br />No surprises.</h2>
                        <p>We believe in complete transparency. See exactly how much your recipient will get in Ghana before you even sign up.</p>
                    </div>

                    <div className="premium-calc-glass-card">
                        <RateCalculator rate={rate} />

                        <div className="calc-trust-badges">
                            <div className="trust-badge"><span className="checkmark">✓</span> Guaranteed Exchange Rates</div>
                            <div className="trust-badge"><span className="checkmark">✓</span> Zero Hidden Markup</div>
                            <div className="trust-badge"><span className="checkmark">✓</span> Instant Payouts</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium "Send Smarter" Impact Section */}
            <section className="send-smarter-section premium-smarter-section reveal-on-scroll" ref={addToRefs}>
                <div className="editorial-grid-bg" style={{ opacity: 0.2 }}>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                </div>

                <div className="smarter-content-layer">
                    <div className="giant-text-container">
                        <h1 className="giant-text top">SEND</h1>
                        <h1 className="giant-text bottom">SMARTER</h1>
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

            {/* Premium Mission List (How It Works) - DARK THEME */}
            <section id="how-it-works" className="section-padding premium-mission-section dark-theme reveal-on-scroll" ref={addToRefs} style={{ position: 'relative' }}>
                <div className="editorial-grid-bg" style={{ opacity: 0.1 }}>
                    <div className="vertical-line" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="vertical-line" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="vertical-line" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="vertical-line" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="vertical-line" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <div className="mission-content-layer">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 className="signature-font" style={{ fontSize: '4rem', marginBottom: '16px' }}>The Mission.</h2>
                        <p style={{ fontSize: '1.25rem' }}>No complexity. Just pure cross-border movement in 3 steps.</p>
                    </div>

                    <div className="editorial-mission-grid">
                        <div className="editorial-mission-box">
                            <div className="box-number signature-font">01</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Secure Connection</h3>
                            <p style={{ lineHeight: '1.6' }}>Sign up in seconds and complete our simple identity check. Bank-grade security keeps your funds and data totally safe.</p>
                        </div>
                        <div className="editorial-mission-box">
                            <div className="box-number signature-font">02</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Send Anywhere</h3>
                            <p style={{ lineHeight: '1.6' }}>Enter the amount, select your recipient, and pay via Interac e-Transfer or direct Bank Transfer from your Canadian account.</p>
                        </div>
                        <div className="editorial-mission-box">
                            <div className="box-number signature-font">03</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Instant Payout</h3>
                            <p style={{ lineHeight: '1.6' }}>Funds land instantly in Ghana via Mobile Money (MTN, Vodafone, AirtelTigo) or directly into their Bank Account.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Success Wall (Rigid Grid) */}
            <section className="section-padding premium-success-section reveal-on-scroll" ref={addToRefs} style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
                <div className="content-grid" style={{ alignItems: 'start' }}>
                    <div className="success-stats-col">
                        <h2 className="signature-font" style={{ fontSize: '4rem', color: 'var(--secondary)', marginBottom: '24px', lineHeight: '1.1' }}>Movement in Numbers.</h2>
                        <div style={{ display: 'grid', gap: '32px', marginTop: '40px' }}>
                            <div className="stat-block">
                                <div className="stat-value">$20M+</div>
                                <div className="stat-label">Transferred Yearly</div>
                            </div>
                            <div className="stat-block">
                                <div className="stat-value" style={{ color: 'var(--success)' }}>99.9%</div>
                                <div className="stat-label">Success Rate</div>
                            </div>
                            <div className="stat-block">
                                <div className="stat-value" style={{ color: 'var(--primary)' }}>Instant</div>
                                <div className="stat-label">Payout Speed</div>
                            </div>
                        </div>
                    </div>

                    <div className="editorial-success-grid">
                        <div className="editorial-testimonial-card editorial-card">
                            <div className="test-header">
                                <span className="test-status">✓ VERIFIED</span>
                                <span className="test-author">A. Boateng</span>
                            </div>
                            <p className="test-quote">"Sent GH₵2.5k to Kumasi instantly. The live rate tracking feature gave me total peace of mind."</p>
                        </div>
                        <div className="editorial-testimonial-card editorial-card">
                            <div className="test-header">
                                <span className="test-status">✓ VERIFIED</span>
                                <span className="test-author">J. Mensah</span>
                            </div>
                            <p className="test-quote">"Best exchange rates I've found in Toronto. No hidden markup like the big banks."</p>
                        </div>
                        <div className="editorial-testimonial-card editorial-card">
                            <div className="test-header">
                                <span className="test-status">✓ VERIFIED</span>
                                <span className="test-author">K. Asare</span>
                            </div>
                            <p className="test-quote">"A truly beautiful app. The transfer was completely seamless."</p>
                        </div>
                        <div className="editorial-testimonial-card editorial-card">
                            <div className="test-header">
                                <span className="test-status">✓ VERIFIED</span>
                                <span className="test-author">M. Osei</span>
                            </div>
                            <p className="test-quote">"Zero hidden charges as promised. Support team is elite."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section (Razor Sharp Editorial) */}
            <section className="faq-section reveal-on-scroll" id="faq" ref={addToRefs} style={{ background: 'white', padding: '100px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="signature-font" style={{ fontSize: '4rem', color: 'var(--secondary)' }}>Stated Simply.</h2>
                </div>
                <div className="editorial-faq-container">
                    {[
                        {
                            q: "How fast will my money reach Ghana?",
                            a: "Transfers to Mobile Money (MTN, Vodafone, AirtelTigo) are instant. Bank transfers typically complete within minutes but may take up to 24 hours depending on the receiving bank."
                        },
                        {
                            q: "Are there any hidden fees?",
                            a: "Absolutely not. The rate you see on our Live Pulse converter is exactly what you get. We charge a flat, transparent upfront fee clearly shown before you send."
                        },
                        {
                            q: "Is Qwiktransfers safe and secure?",
                            a: "Yes. We use bank-grade 256-bit encryption to protect your data. We are fully licensed and regulated to ensure your funds and identity are always protected."
                        },
                        {
                            q: "How can I track my transfer?",
                            a: "You can track your transfer in real-time through your dashboard. You will also receive instant email notifications the moment the funds hit your recipient's account."
                        }
                    ].map((faq, index) => (
                        <div className="editorial-faq-item" key={index} style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{faq.q}</strong>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+</span>
                            </div>
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vibrant Blue CTA Section (Image 1 Style) */}
            <section className="vibrant-cta-section reveal-on-scroll" ref={addToRefs}>
                <div className="cta-content-grid">
                    <div className="cta-visual-container">
                        <div className="cta-main-circle">
                            <div className="cta-receipt-icon">
                                <strong>₵</strong>
                                <span className="cta-badge">+$</span>
                            </div>
                            <div className="cta-receipt-amount">2,500.00</div>
                            <div className="cta-receipt-desc">Pocket Money<br /><span>Sent</span></div>
                        </div>
                        <div className="cta-face-circle face-top-left">
                            <img src="https://i.pravatar.cc/150?img=47" alt="User" />
                        </div>
                        <div className="cta-face-circle face-bottom-left">
                            <img src="https://i.pravatar.cc/150?img=11" alt="User" />
                        </div>
                        <div className="cta-face-circle face-bottom-right">
                            <img src="https://i.pravatar.cc/150?img=12" alt="User" />
                        </div>
                    </div>

                    <div className="cta-text-container">
                        <h2>Make your move<br />Qwikly.</h2>
                        <p>Join thousands of Ghanaians and Canadians who trust Qwiktransfers for their cross-border payments.</p>
                        <Link to="/register" className="btn-cta-white">Create Free Account</Link>
                    </div>
                </div>
            </section>

            </div>
        </LandingLayout>
    );
};

export default Home;
