import React from 'react';
import LandingLayout from '../components/LandingLayout';

const ContactUs = () => {
    return (
        <LandingLayout>
            <section className="section-padding" style={{ background: 'white', position: 'relative' }}>
                <div className="editorial-grid-bg" style={{ opacity: 0.2 }}>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                    <div className="vertical-line"></div>
                </div>

                <div className="mission-content-layer">
                    <div className="content-grid" style={{ alignItems: 'start' }}>
                        <div>
                            <h1 className="signature-font" style={{ fontSize: '4.5rem', color: 'var(--secondary)', marginBottom: '24px' }}>Get in touch.</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '48px' }}>
                                Have a question or need assistance with a transfer? Our team is available 24/7 to help you move money qwikly.
                            </p>

                            <div style={{ display: 'grid', gap: '32px' }}>
                                <div className="stat-block">
                                    <div className="stat-label">Email Support</div>
                                    <div className="stat-value" style={{ fontSize: '2rem' }}>info@qwiktransfers.com</div>
                                </div>
                                <div className="stat-block">
                                    <div className="stat-label">WhatsApp Support</div>
                                    <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--success)' }}>+1 (647) 000-0000</div>
                                </div>
                                <div className="stat-block">
                                    <div className="stat-label">Toronto Hub</div>
                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>Downtown Toronto, ON, Canada</div>
                                </div>
                            </div>
                        </div>

                        <div className="editorial-mission-box" style={{ padding: '48px' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '32px' }}>Send us a message</h2>
                            <form style={{ display: 'grid', gap: '24px' }}>
                                <div className="calc-input-group">
                                    <label>Full Name</label>
                                    <input type="text" className="calc-input" placeholder="Kofi Mensah" style={{ border: '1px solid var(--border-color)' }} />
                                </div>
                                <div className="calc-input-group">
                                    <label>Email Address</label>
                                    <input type="email" className="calc-input" placeholder="kofi@example.com" style={{ border: '1px solid var(--border-color)' }} />
                                </div>
                                <div className="calc-input-group">
                                    <label>How can we help?</label>
                                    <textarea className="calc-input" placeholder="Your message..." style={{ border: '1px solid var(--border-color)', minHeight: '120px', padding: '16px' }}></textarea>
                                </div>
                                <button type="button" className="btn-primary" style={{ width: '100%', padding: '16px' }}>Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default ContactUs;
