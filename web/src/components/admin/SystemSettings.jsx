import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [backups, setBackups] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Form states for contact info
    const [contactInfo, setContactInfo] = useState({
        system_name: '',
        system_email: '',
        system_contact: '',
        system_address: ''
    });

    useEffect(() => {
        fetchConfigs();
        fetchBackups();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/system/config');
            setConfigs(res.data);
            setContactInfo({
                system_name: res.data.system_name || '',
                system_email: res.data.system_email || '',
                system_contact: res.data.system_contact || '',
                system_address: res.data.system_address || ''
            });
            if (res.data.system_logo) {
                setLogoPreview(`${import.meta.env.VITE_API_URL}/${res.data.system_logo}`);
            }
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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const fetchBackups = async () => {
        try {
            const res = await api.get('/system/backups');
            setBackups(res.data);
        } catch (error) {
            console.error('Failed to fetch backups');
        }
    };

    const handleManualBackup = async () => {
        setBackingUp(true);
        const tid = toast.loading('Creating system snapshot...');
        try {
            await api.post('/system/backup/manual');
            toast.success('Backup created successfully!', { id: tid });
            fetchBackups();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Backup failed', { id: tid });
        } finally {
            setBackingUp(false);
        }
    };

    const handleDownloadBackup = async (filename) => {
        try {
            const response = await api.get(`/system/backups/download/${filename}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            link.click();
        } catch (error) {
            toast.error('Download failed');
        }
    };

    const handleUploadLogo = async () => {
        if (!logoFile) return;
        setSaving(true);
        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
            const res = await api.post('/system/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Logo updated successfully');
            setConfigs(prev => ({ ...prev, system_logo: res.data.logo_url }));
            // Trigger a sidebar refresh if needed (e.g., via event)
            window.dispatchEvent(new CustomEvent('system-config-updated'));
        } catch (error) {
            toast.error('Failed to upload logo');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContactInfo = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await Promise.all([
                api.post('/system/config', { key: 'system_name', value: contactInfo.system_name }),
                api.post('/system/config', { key: 'system_email', value: contactInfo.system_email }),
                api.post('/system/config', { key: 'system_contact', value: contactInfo.system_contact }),
                api.post('/system/config', { key: 'system_address', value: contactInfo.system_address })
            ]);
            toast.success('Contact information updated');
            window.dispatchEvent(new CustomEvent('system-config-updated'));
        } catch (error) {
            toast.error('Failed to update contact information');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>System Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Manage global platform branding, contact info, and maintenance.
            </p>

            <div style={{ display: 'grid', gap: '24px' }}>
                {/* Branding Section */}
                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>System Branding</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9f9f9' }}>
                            {logoPreview ? (
                                <img src={logoPreview} alt="System Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', opacity: 0.2 }}>🖼️</span>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>System Name</label>
                                <input
                                    type="text"
                                    value={contactInfo.system_name}
                                    onChange={(e) => setContactInfo({ ...contactInfo, system_name: e.target.value })}
                                    placeholder="Qwiktransfers"
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>System Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                style={{ display: 'block', marginBottom: '16px', fontSize: '0.85rem' }}
                            />
                            <button
                                onClick={handleUploadLogo}
                                className="btn-primary"
                                disabled={saving || !logoFile}
                                style={{ width: 'auto', padding: '8px 24px', fontSize: '0.85rem' }}
                            >
                                Upload New Logo
                            </button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                The name and logo will appear in the browser tab and sidebar.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Contact Information</h3>
                    <form onSubmit={handleSaveContactInfo}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>System Email</label>
                                <input
                                    type="email"
                                    value={contactInfo.system_email}
                                    onChange={(e) => setContactInfo({ ...contactInfo, system_email: e.target.value })}
                                    placeholder="support@qwiktransfers.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>System Contact Phone</label>
                                <input
                                    type="text"
                                    value={contactInfo.system_contact}
                                    onChange={(e) => setContactInfo({ ...contactInfo, system_contact: e.target.value })}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Physical Address</label>
                            <textarea
                                value={contactInfo.system_address}
                                onChange={(e) => setContactInfo({ ...contactInfo, system_address: e.target.value })}
                                placeholder="123 Transfer Way, Suite 100, Financial District"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', fontSize: '0.9rem' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving} style={{ width: 'auto', padding: '10px 32px' }}>
                            Save Contact Details
                        </button>
                    </form>
                </div>

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

                {/* System Backup */}
                <section className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>System Persistence & Recovery</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Manage database snapshots and automated recovery points.</p>
                        </div>
                        <button
                            onClick={handleManualBackup}
                            disabled={backingUp}
                            className="btn-primary"
                            style={{
                                width: 'auto',
                                padding: '10px 24px',
                                background: 'var(--text-deep-brown)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {backingUp ? '🏗️ Processing...' : '🛡️ Backup Now'}
                        </button>
                    </div>

                    <div style={{ background: '#fcfcfc', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Automated Daily Backup</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger a full database snapshot every night at 3:00 AM.</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={configs.auto_backup_daily === 'true'}
                                    onChange={(e) => handleUpdateConfig('auto_backup_daily', e.target.checked ? 'true' : 'false')}
                                    disabled={saving}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div style={{ padding: '0' }}>
                            <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f9f9f9' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', fontSize: '0.75rem', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>Created At</th>
                                        <th style={{ textAlign: 'left', fontSize: '0.75rem', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>Size</th>
                                        <th style={{ textAlign: 'right', fontSize: '0.75rem', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups.length > 0 ? backups.slice(0, 5).map(b => (
                                        <tr key={b.filename}>
                                            <td style={{ fontSize: '0.85rem', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>{new Date(b.createdAt).toLocaleString()}</td>
                                            <td style={{ fontSize: '0.85rem', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>{(b.size / 1024 / 1024).toFixed(2)} MB</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>
                                                <button
                                                    onClick={() => handleDownloadBackup(b.filename)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                                                >
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                No backups available yet. Click "Backup Now" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

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
