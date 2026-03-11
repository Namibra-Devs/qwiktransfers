import React from 'react';
import LandingLayout from '../components/LandingLayout';

const PrivacyPolicy = () => {
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

                <div className="mission-content-layer" style={{ maxWidth: '800px' }}>
                    <h1 className="signature-font" style={{ fontSize: '4rem', color: 'var(--secondary)', marginBottom: '40px' }}>Privacy Policy.</h1>
                    
                    <div style={{ color: 'var(--secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        <p style={{ marginBottom: '24px' }}>Last Updated: March 11, 2026</p>
                        
                        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '16px' }}>1. Introduction</h2>
                        <p style={{ marginBottom: '24px' }}>
                            At Qwiktransfers, your privacy is our priority. This policy outlines how we collect, use, and protect your personal data when you use our cross-border payment services.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '16px' }}>2. Data Collection</h2>
                        <p style={{ marginBottom: '24px' }}>
                            To provide our services, we collect information such as your name, email address, phone number, and government-issued identification for KYC (Know Your Customer) compliance.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '16px' }}>3. Use of Information</h2>
                        <p style={{ marginBottom: '24px' }}>
                            Your data is used strictly for processing transfers, preventing fraud, and complying with anti-money laundering (AML) regulations. We never sell your data to third parties.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '16px' }}>4. Security</h2>
                        <p style={{ marginBottom: '24px' }}>
                            We use bank-grade 256-bit encryption and secure servers to ensure your information remains private and protected at all times.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '16px' }}>5. Contact Us</h2>
                        <p style={{ marginBottom: '24px' }}>
                            If you have any questions about this policy, please reach out to us at support@qwiktransfers.com.
                        </p>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default PrivacyPolicy;
