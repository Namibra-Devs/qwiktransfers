import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/system/config');
            setConfigs(res.data);
        } catch (error) {
            toast.error('Failed to load system configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async (key, value) => {
        setSaving(true);
        try {
            await api.post('/system/config', { key, value });
            setConfigs(prev => ({ ...prev, [key]: value }));
            toast.success('Configuration updated');
        } catch (error) {
            toast.error('Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>System Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Manage global platform maintenance and automated background tasks.
            </p>

            <div style={{ display: 'grid', gap: '24px' }}>
                {/* Automated Maintenance */}
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Automated Maintenance</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Keep the database lean by automatically cleaning up old records.
                            </p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={configs.auto_audit_cleanup === 'true'}
                                onChange={(e) => handleUpdateConfig('auto_audit_cleanup', e.target.checked ? 'true' : 'false')}
                                disabled={saving}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--accent-peach)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-deep-brown)' }}>
                        <strong>Current Policy:</strong> Audit logs older than <strong>90 days</strong> are deleted automatically every hour if this is enabled.
                    </div>
                </div>

                {/* System Health Overview */}
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>System Health & Monitoring</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Monitoring Engine</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                                <span style={{ fontWeight: 700 }}>Active</span>
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Platform Alerts</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                                <span style={{ fontWeight: 700 }}>Operational</span>
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                        * Alerts are triggered automatically for volume drops or suspicious KYC activity.
                    </p>
                </div>

                {/* Platform Toggles Placeholder */}
                <div className="card" style={{ opacity: 0.6 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Global Platform Toggles</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Maintenance mode and other global restrictions will appear here in a future update.
                    </p>
                </div>
            </div>

            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 26px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--primary);
                }
                input:checked + .slider:before {
                    transform: translateX(24px);
                }
            `}</style>
        </div>
    );
};

export default SystemSettings;
