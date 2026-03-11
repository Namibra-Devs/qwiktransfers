import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { Link } from 'react-router-dom';

const AboutVendor = () => {
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
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h1 className="signature-font" style={{ fontSize: '4.5rem', color: 'var(--secondary)', marginBottom: '16px' }}>The Vendor Network.</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                            Empowering local payout partners with the technology to facilitate instant, cross-border financial movement.
                        </p>
                    </div>

                    <div className="editorial-mission-grid">
                        <div className="editorial-mission-box">
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--secondary)' }}>High Visibility</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Get listed on Ghana's most trusted cross-border platform. Gain access to thousands of users sending money from Canada daily.
                            </p>
                        </div>
                        <div className="editorial-mission-box">
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--secondary)' }}>Seamless Payouts</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Our automated system handles the tracking and verification. You simply facilitate the final payout to the recipient.
                            </p>
                        </div>
                        <div className="editorial-mission-box">
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--secondary)' }}>Growth & Revenue</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Earn competitive commissions on every transaction you facilitate. Scale your business by becoming a pillar of your local community.
                            </p>
                        </div>
                    </div>

                    <div className="vibrant-cta-section" style={{ marginTop: '100px', borderRadius: '24px' }}>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <h2 style={{ color: 'white', fontSize: '3rem', marginBottom: '24px' }}>Ready to partner?</h2>
                            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}> Join our elite network of payout partners and start earning today. </p>
                            <Link to="/vendor-register" className="btn-cta-white">Join Vendor Network</Link>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default AboutVendor;
