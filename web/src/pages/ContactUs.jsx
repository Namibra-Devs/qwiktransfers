import React, { useState } from 'react';
import LandingLayout from '../components/LandingLayout';
import api from '../services/api';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.post('/support/inquiry', formData);
            setSuccess(res.data.message);
            setFormData({
                full_name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

                <div className="mission-content-layer" style={{ marginTop: '100px' }}>
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

                            {success && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    borderLeft: '4px solid var(--success)'
                                }}>
                                    <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>{success}</p>
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(216, 59, 1, 0.1)',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    borderLeft: '4px solid var(--danger)'
                                }}>
                                    <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                                <div className="calc-input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="calc-input"
                                        placeholder="Kofi Mensah"
                                        style={{ border: '1px solid var(--border-color)' }}
                                        required
                                    />
                                </div>
                                <div className="calc-input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="calc-input"
                                        placeholder="kofi@example.com"
                                        style={{ border: '1px solid var(--border-color)' }}
                                        required
                                    />
                                </div>
                                <div className="calc-input-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="calc-input"
                                        placeholder="How can we help?"
                                        style={{ border: '1px solid var(--border-color)' }}
                                        required
                                    />
                                </div>
                                <div className="calc-input-group">
                                    <label>Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="calc-input"
                                        placeholder="Your message..."
                                        style={{ border: '1px solid var(--border-color)', minHeight: '120px', padding: '16px' }}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '16px' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default ContactUs;
