import React, { useState, useEffect, useRef } from 'react';
import Big from 'big.js';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import NotificationPanel from '../components/NotificationPanel';
import Button from '../components/Button';
import VendorRegister from './VendorRegister';
import { generateReceiptPDF } from '../utils/ReceiptGenerator';
import Home from './Home';
import Input from '../components/Input';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RateLockTimer = ({ lockedUntil }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!lockedUntil) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(lockedUntil);
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lockedUntil]);

    if (!lockedUntil) return null;

    return (
        <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: timeLeft === 'EXPIRED' ? 'var(--danger)' : 'var(--primary)',
            background: timeLeft === 'EXPIRED' ? '#fee2e2' : 'var(--accent-peach)',
            padding: '4px 10px',
            borderRadius: '6px'
        }}>
            {timeLeft === 'EXPIRED' ? 'RATE EXPIRED' : `RATE SECURED: ${timeLeft}`}
        </div>
    );
};

const RateWatchCard = () => {
    const [alerts, setAlerts] = useState([]);
    const [targetRate, setTargetRate] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/system/rate-alerts');
            setAlerts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const setAlert = async () => {
        if (!targetRate) return toast.error("Enter a target rate");
        setLoading(true);
        try {
            await api.post('/system/rate-alerts', { targetRate: new Big(targetRate).toNumber(), direction: 'above' });
            toast.success("Rate alert set!");
            setTargetRate('');
            fetchAlerts();
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
        } catch (error) {
            toast.error("Failed to set alert");
        } finally {
            setLoading(false);
        }
    };

    const deleteAlert = async (id) => {
        try {
            await api.delete(`/system/rate-alerts/${id}`);
            setAlerts(alerts.filter(a => a.id !== id));
            toast.success("Alert removed");
        } catch (error) {
            toast.error("Failed to delete alert");
        }
    };

    return (
        <section className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 700 }}>Rate Watcher</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Target Rate (GHS)"
                        value={targetRate}
                        onChange={(e) => setTargetRate(e.target.value)}
                        style={{ padding: '10px 14px' }} // Slightly override for compact look
                    />
                </div>
                <Button
                    onClick={setAlert}
                    loading={loading}
                    style={{ width: 'auto', padding: '10px 20px', height: '44px' }}
                >
                    Set Alert
                </Button>
            </div>
            {alerts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {alerts.map(alert => (
                        <div key={alert.id} style={{
                            fontSize: '0.75rem',
                            background: 'var(--accent-peach)',
                            color: 'var(--primary)',
                            padding: '6px 12px',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 800,
                            border: '1px solid var(--border-color)'
                        }}>
                            1 CAD ≥ {new Big(alert.targetRate).toFixed(2)}
                            <span onClick={() => deleteAlert(alert.id)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '1rem' }}>&times;</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

const TransactionAnalytics = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="analytics-container" style={{ opacity: 0.7 }}>
                <div className="analytics-header">
                    <div>
                        <div className="skeleton-box" style={{ height: '24px', width: '180px', marginBottom: '8px' }}></div>
                        <div className="skeleton-box" style={{ height: '14px', width: '120px' }}></div>
                    </div>
                    <div className="analytics-kpis">
                        <div className="kpi-item">
                            <div className="skeleton-box" style={{ height: '12px', width: '60px', marginBottom: '6px' }}></div>
                            <div className="skeleton-box" style={{ height: '20px', width: '80px' }}></div>
                        </div>
                        <div className="kpi-item">
                            <div className="skeleton-box" style={{ height: '12px', width: '60px', marginBottom: '6px' }}></div>
                            <div className="skeleton-box" style={{ height: '20px', width: '40px' }}></div>
                        </div>
                        <div className="kpi-item">
                            <div className="skeleton-box" style={{ height: '12px', width: '60px', marginBottom: '6px' }}></div>
                            <div className="skeleton-box" style={{ height: '20px', width: '40px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="chart-wrapper">
                    <div className="skeleton-box" style={{ height: '100%', width: '100%', borderRadius: '12px' }}></div>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: data?.history?.volume?.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [
            {
                fill: true,
                label: 'Transaction Volume',
                data: data?.history?.volume?.map(h => h.total_sent) || [],
                borderColor: '#B7472A',
                backgroundColor: 'rgba(183, 71, 42, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#B7472A',
                borderWidth: 3,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E1B18',
                titleColor: '#FFD700',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10, weight: 600 }, color: '#888' } },
            y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 600 }, color: '#888' } }
        }
    };

    return (
        <div className="analytics-container fade-in">
            <div className="analytics-header">
                <div>
                    <h3 className="analytics-title">Transaction Insights</h3>
                    <p className="analytics-subtitle">Past 30 days activity</p>
                </div>
                <div className="analytics-kpis">
                    <div className="kpi-item">
                        <span className="kpi-label">Vol. Success</span>
                        <span className="kpi-value">${data.successVolume?.toLocaleString() || 0}</span>
                    </div>
                    <div className="kpi-item">
                        <span className="kpi-label">Transfers</span>
                        <span className="kpi-value">{data.totalSentCount || 0}</span>
                    </div>
                    <div className="kpi-item">
                        <span className="kpi-label">Pending</span>
                        <span className="kpi-value">{data.pendingCount || 0}</span>
                    </div>
                </div>
            </div>
            <div className="chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const { user, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        system_name: 'QWIK',
        system_logo: ''
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRes = await api.get('/system/config/public');
                setConfig({
                    system_name: configRes.data.system_name || 'QWIK',
                    system_logo: configRes.data.system_logo || ''
                });
            } catch (error) {
                console.error('Config fetch error:', error);
            }
        };
        fetchConfig();
        fetchNotifications();
        fetchSystemBranding();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/system/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const fetchSystemBranding = async () => {
        try {
            const res = await api.get('/system/config/public');
            const { system_name, system_logo } = res.data;
            let base64 = null;
            
            if (system_logo) {
                try {
                    const logoUrl = getImageUrl(system_logo);
                    base64 = await urlToBase64(logoUrl);
                } catch (logoErr) {
                    console.warn('Could not convert logo to base64 (CORS or path issue), continuing without logo in PDF:', logoErr);
                }
            }

            setSystemBranding({
                name: system_name || 'QWIK TRANSFERS',
                logo: system_logo,
                base64Logo: base64
            });
        } catch (error) {
            console.error('Failed to fetch system branding info:', error);
        }
    };

    const urlToBase64 = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Timeout after 5 seconds to avoid hanging
            const timeout = setTimeout(() => {
                img.src = ''; 
                reject(new Error('Image load timeout'));
            }, 5000);

            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                clearTimeout(timeout);
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = (err) => {
                clearTimeout(timeout);
                reject(err);
            };
            img.src = url;
        });
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin');
        }
    }, [user, navigate]);

    const [transactions, setTransactions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [systemBranding, setSystemBranding] = useState({ name: 'QWIK TRANSFERS', logo: null, base64Logo: null });
    const [amount, setAmount] = useState('');
    const [recipientType, setRecipientType] = useState('momo');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('GHS');
    const [toCurrency, setToCurrency] = useState('CAD');

    useEffect(() => {
        if (user && user.country === 'Canada') {
            setFromCurrency('CAD');
            setToCurrency('GHS');
        } else if (user && user.country === 'Ghana') {
            setFromCurrency('GHS');
            setToCurrency('CAD');
        }
    }, [user?.country]);
    const [rate, setRate] = useState(0.09);
    const [loading, setLoading] = useState(false);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    // New Multi-step States
    const [formStep, setFormStep] = useState(1);
    const [bankName, setBankName] = useState('');
    const [momoProvider, setMomoProvider] = useState('');
    const [note, setNote] = useState('');
    const [adminReference, setAdminReference] = useState('');

    // Canada specific fields
    const [transitNumber, setTransitNumber] = useState('');
    const [institutionNumber, setInstitutionNumber] = useState('');
    const [interacEmail, setInteracEmail] = useState('');

    // PIN Modal States
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinAction, setPinAction] = useState(null); // { type: 'send' | 'upload', data: any }

    // Details Modal States
    const [selectedTx, setSelectedTx] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewDate, setPreviewDate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Pagination & Search States
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const [rateLockedUntil, setRateLockedUntil] = useState(null);

    // Export States
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });

    // Body scroll lock for modals
    useEffect(() => {
        if (showDetailsModal || showPreviewModal || showPinModal || showExportModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [showDetailsModal, showPreviewModal, showPinModal, showExportModal]);

    // Payment Methods State
    const [ghsPaymentMethod, setGhsPaymentMethod] = useState(null);
    const [cadPaymentMethod, setCadPaymentMethod] = useState(null);

    // Analytics State
    const [userStats, setUserStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchPaymentMethods();
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/transactions/user/stats');
            setUserStats(res.data);
        } catch (error) {
            console.error('Failed to fetch user stats');
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const res = await api.get('/system/payment-methods');
            const methods = res.data;
            const ghs = methods.find(m => m.type === 'momo-ghs');
            const cad = methods.find(m => m.type === 'interac-cad');

            if (ghs) setGhsPaymentMethod(typeof ghs.details === 'string' ? JSON.parse(ghs.details) : ghs.details);
            if (cad) setCadPaymentMethod(typeof cad.details === 'string' ? JSON.parse(cad.details) : cad.details);
        } catch (error) {
            console.error('Failed to fetch payment methods');
        }
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const momoProviders = [
        { id: 'mtn', name: 'MTN Momo', color: '#FFCC00', textColor: '#000' },
        { id: 'telecel', name: 'Telecel Cash', color: '#E60000', textColor: '#fff' },
        { id: 'airteltigo', name: 'AirtelTigo Money', color: '#003399', textColor: '#fff' }
    ];

    const ghanaBanks = [
        'GCB Bank', 'Ecobank Ghana', 'Absa Bank', 'Zenith Bank', 'Standard Chartered', 'Fidelity Bank', 'Stanbic Bank', 'ADB Bank'
    ];

    useEffect(() => {
        fetchTransactions();
        fetchRate();
    }, [page, search]);

    // Reset recipient details when destination currency changes
    useEffect(() => {
        if (toCurrency === 'CAD') {
            setRecipientType('interac'); // Default for Canada
        } else {
            setRecipientType('momo'); // Default for Ghana
        }
    }, [toCurrency]);

    const fetchRate = async () => {
        try {
            const res = await api.get('/rates');
            setRate(res.data.rate);
        } catch (error) {
            console.error('Failed to fetch rate', error);
        }
    };

    const fetchTransactions = async () => {
        setIsHistoryLoading(true);
        try {
            const res = await api.get(`/transactions?page=${page}&limit=10&search=${search}`);
            setTransactions(res.data.transactions);
            setTotalPages(res.data.pages);
            setTotalTransactions(res.data.total);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load transaction history');
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleCancelTransaction = (id) => {
        setPinAction({ type: 'cancel', data: id });
        setShowPinModal(true);
    };

    const executeCancel = async (id) => {
        try {
            await api.patch(`/transactions/${id}/cancel`);
            toast.success('Transaction cancelled successfully');
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
            setShowDetailsModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel transaction');
        }
    };

    const handleExport = async () => {
        try {
            const url = exportDates.start && exportDates.end
                ? `/transactions/export?startDate=${exportDates.start}&endDate=${exportDates.end}`
                : '/transactions/export';

            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `transactions-${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowExportModal(false);
            toast.success('Export started!');
        } catch (error) {
            toast.error('Failed to export transactions');
        }
    };

    const handleCurrencySwitch = () => {
        const tempFrom = fromCurrency;
        const tempTo = toCurrency;
        setFromCurrency(tempTo);
        setToCurrency(tempFrom);
        setRate(1 / rate);
        setFormStep(1); // Reset step if currency changes
    };

    const generateReference = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'QW-';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const resetForm = () => {
        setFormStep(1);
        setAmount('');
        setRecipientName('');
        setRecipientAccount('');
        setBankName('');
        setMomoProvider('');
        setNote('');
        setAdminReference('');
        setTransitNumber('');
        setInstitutionNumber('');
        setInteracEmail('');
        setPin('');
        setRateLockedUntil(null);
    };

    const nextStep = () => {
        if (formStep === 1) {
            if (!amount || amount <= 0) return toast.error('Please enter a valid amount');
            setFormStep(2);
        } else if (formStep === 2) {
            if (!recipientName) return toast.error('Please enter recipient name');

            if (toCurrency === 'CAD') {
                if (recipientType === 'bank' && (!recipientAccount || !transitNumber || !institutionNumber)) {
                    return toast.error('Please fill in all bank details');
                }
                if (recipientType === 'interac' && !interacEmail) {
                    return toast.error('Please enter Interac email');
                }
                if (recipientType === 'interac' && !isValidEmail(interacEmail)) {
                    return toast.error('Please enter a valid Interac email');
                }
            } else { // GHS
                if (recipientType === 'momo' && (!recipientAccount || !momoProvider)) {
                    return toast.error('Please fill in Momo details');
                }
                if (recipientType === 'bank' && (!recipientAccount || !bankName)) {
                    return toast.error('Please fill in bank details');
                }
            }

            setAdminReference(generateReference());
            setFormStep(3);
        }
    };

    const prevStep = () => setFormStep(formStep - 1);

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-pin', { pin });
            setShowPinModal(false);
            setShowDetailsModal(false); // Hide details modal so processing UI covers screen
            setPin('');
            setIsGlobalLoading(true); // Start processing loader AFTER pin vanishes

            if (pinAction.type === 'send') {
                await executeSend();
            } else if (pinAction.type === 'upload') {
                await executeUpload(pinAction.data.txId, pinAction.data.file);
            } else if (pinAction.type === 'cancel') {
                await executeCancel(pinAction.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'PIN Verification Failed');
        } finally {
            setLoading(false);
            setIsGlobalLoading(false); // Stop processing loader
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        setPinAction({ type: 'send' });
        setShowPinModal(true);
    };

    const executeSend = async () => {
        try {
            const res = await api.post('/transactions', {
                amount_sent: amount,
                type: `${fromCurrency}-${toCurrency}`,
                recipient_details: {
                    type: recipientType,
                    name: recipientName,
                    account: recipientAccount,
                    bank_name: bankName,
                    momo_provider: momoProvider,
                    transit_number: transitNumber,
                    institution_number: institutionNumber,
                    interac_email: interacEmail,
                    note: note,
                    admin_reference: adminReference
                }
            });

            setRateLockedUntil(res.data.rate_locked_until);
            setRateLockedUntil(res.data.rate_locked_until);
            fetchTransactions();
            toast.success('Transfer Initiated! Please follow payment instructions.');
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
            setFormStep(4); // Move to success step
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send request');
        }
    };

    const handleUploadProof = (txId, file) => {
        if (!file) return;
        setPinAction({ type: 'upload', data: { txId, file } });
        setShowPinModal(true);
    };

    const executeUpload = async (txId, file) => {
        const formData = new FormData();
        formData.append('proof', file);
        try {
            await api.post(`/transactions/${txId}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchTransactions();
            toast.success('Proof uploaded!');
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
        } catch (error) {
            toast.error('Failed to upload proof');
        }
    };

    const handleKYCUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        setLoading(true);
        try {
            await api.post('/auth/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('KYC Document uploaded!');
            if (refreshProfile) refreshProfile();
        } catch (error) {
            toast.error('KYC Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (tx) => {
        setSelectedTx(tx);
        setShowDetailsModal(true);
    };

    return (
        <div className="dashboard-container">
            {isGlobalLoading && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-deep-brown)' }}>Processing your request...</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please do not refresh the page.</p>
                </div>
            )}

            <DashboardHeader 
                user={user} 
                logout={logout} 
                config={config} 
                type="user" 
            />

            <main className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 460px) 1fr', gap: '32px', alignItems: 'start' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>


                    <section className="card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Send Money</h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sending {fromCurrency} to {toCurrency}</p>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--accent-peach)', padding: '4px 10px', borderRadius: '20px' }}>
                                {formStep === 4 ? 'Success' : `Step ${formStep} of 3`}
                            </span>
                        </div>

                        {formStep === 1 && (
                            <div className="fade-in">
                                <Input
                                    label="You send"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    style={{ fontSize: '1.25rem', fontWeight: 600 }}
                                />

                                <div style={{ textAlign: 'center', margin: '-10px 0 10px 0' }}>
                                    <button type="button" onClick={handleCurrencySwitch} style={{ background: 'var(--accent-peach)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        ⇅
                                    </button>
                                </div>

                                <Input
                                    label="Recipient gets"
                                    value={amount ? new Big(amount).times(rate).toFixed(2) : '0.00'}
                                    readOnly
                                    style={{ background: 'var(--bg-main)', fontSize: '1.25rem', fontWeight: 600, cursor: 'not-allowed' }}
                                    placeholder="0.00"
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '8px', fontWeight: 500 }}>
                                    Exchange Rate: 1 {fromCurrency} = {new Big(rate).toFixed(4)} {toCurrency}
                                </p>

                                <Input
                                    label="Note / Reference (Optional)"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What is this for?"
                                    style={{ marginBottom: '12px' }}
                                />

                                <Button onClick={nextStep} style={{ marginTop: '12px' }}>Next: Recipient Details</Button>
                            </div>
                        )}

                        {formStep === 2 && (
                            <div className="fade-in">
                                <div className="form-group">
                                    <label>Recipient Method</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {toCurrency === 'GHS' ? (
                                            <>
                                                <Button
                                                    onClick={() => setRecipientType('momo')}
                                                    variant={recipientType === 'momo' ? 'primary' : 'outline'}
                                                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                                                >
                                                    Mobile Money
                                                </Button>
                                                <Button
                                                    onClick={() => setRecipientType('bank')}
                                                    variant={recipientType === 'bank' ? 'primary' : 'outline'}
                                                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                                                >
                                                    Bank Transfer
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => setRecipientType('interac')}
                                                    variant={recipientType === 'interac' ? 'primary' : 'outline'}
                                                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                                                >
                                                    Interac e-Transfer
                                                </Button>
                                                <Button
                                                    onClick={() => setRecipientType('bank')}
                                                    variant={recipientType === 'bank' ? 'primary' : 'outline'}
                                                    style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                                                >
                                                    Bank Transfer
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Input
                                    label="Recipient Full Name"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="Full Name"
                                    required
                                />

                                {toCurrency === 'CAD' ? (
                                    recipientType === 'bank' ? (
                                        <div className="fade-in">
                                            <Input
                                                label="Account Number"
                                                value={recipientAccount}
                                                onChange={(e) => setRecipientAccount(e.target.value)}
                                                placeholder="Account Number"
                                                required
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <Input
                                                    label="Transit #"
                                                    value={transitNumber}
                                                    onChange={(e) => setTransitNumber(e.target.value)}
                                                    placeholder="5 digits"
                                                    maxLength="5"
                                                    required
                                                />
                                                <Input
                                                    label="Institution #"
                                                    value={institutionNumber}
                                                    onChange={(e) => setInstitutionNumber(e.target.value)}
                                                    placeholder="3 digits"
                                                    maxLength="3"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <Input
                                            label="Interac Email"
                                            type="email"
                                            value={interacEmail}
                                            onChange={(e) => setInteracEmail(e.target.value)}
                                            placeholder="recipient@email.com"
                                            required
                                            className="fade-in"
                                        />
                                    )
                                ) : ( // GHS
                                    recipientType === 'momo' ? (
                                        <div className="fade-in">
                                            <div className="form-group">
                                                <label style={{ marginBottom: '12px', display: 'block' }}>Select Momo Provider</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                                                    {momoProviders.map(provider => (
                                                        <button
                                                            key={provider.id}
                                                            type="button"
                                                            onClick={() => setMomoProvider(provider.name)}
                                                            style={{
                                                                background: momoProvider === provider.name ? provider.color : 'var(--bg-main)',
                                                                color: momoProvider === provider.name ? provider.textColor : 'var(--text-deep-brown)',
                                                                border: `2px solid ${momoProvider === provider.name ? provider.color : 'var(--border-color)'}`,
                                                                padding: '12px 4px',
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 800,
                                                                transition: 'all 0.2s',
                                                                boxShadow: momoProvider === provider.name ? '0 4px 12px ' + provider.color + '40' : 'none'
                                                            }}
                                                        >
                                                            {provider.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <Input
                                                label="Momo Number"
                                                value={recipientAccount}
                                                onChange={(e) => setRecipientAccount(e.target.value)}
                                                placeholder="024XXXXXXX"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="fade-in">
                                            <div className="form-group">
                                                <label>Select Bank</label>
                                                <select value={bankName} onChange={(e) => setBankName(e.target.value)} required>
                                                    <option value="">Choose a bank...</option>
                                                    {ghanaBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                                </select>
                                            </div>
                                            <Input
                                                label="Account Number"
                                                value={recipientAccount}
                                                onChange={(e) => setRecipientAccount(e.target.value)}
                                                placeholder="Account Number"
                                                required
                                            />
                                        </div>
                                    )
                                )}

                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <Button variant="outline" onClick={prevStep} style={{ flex: 1 }}>Back</Button>
                                    <Button onClick={nextStep} style={{ flex: 2 }}>Next: Review & Pay</Button>
                                </div>
                            </div>
                        )}

                        {formStep === 3 && (
                            <div className="fade-in">
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-muted)' }}>Transfer Summary</h3>
                                        <RateLockTimer lockedUntil={rateLockedUntil} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Amount:</span>
                                        <span style={{ fontWeight: 700 }}>{amount} {fromCurrency}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Recipient Gets:</span>
                                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{(amount * rate).toFixed(2)} {toCurrency}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>To:</span>
                                        <span style={{ fontWeight: 700 }}>{recipientName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Via:</span>
                                        <span style={{ fontWeight: 700 }}>
                                            {toCurrency === 'CAD'
                                                ? (recipientType === 'bank' ? bankName || 'Bank Transfer' : 'Interac e-Transfer')
                                                : (recipientType === 'momo' ? momoProvider : bankName || 'Bank Transfer')}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--text-deep-brown)', color: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--accent-peach)' }}>Payment Instructions</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '16px' }}>
                                        Please send <strong>{amount} {fromCurrency}</strong> to the following admin account:
                                    </p>

                                    {fromCurrency === 'GHS' ? (
                                        <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                                            <div style={{ marginBottom: '4px' }}><strong>MTN Momo:</strong> {ghsPaymentMethod?.number || '055 123 4567'}</div>
                                            <div><strong>Name:</strong> {ghsPaymentMethod?.name || 'Qwiktransfers Limited'}</div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                                            <div style={{ marginBottom: '4px' }}><strong>Interac e-Transfer:</strong> {cadPaymentMethod?.email || 'pay@qwiktransfers.ca'}</div>
                                            <div><strong>Name:</strong> {cadPaymentMethod?.name || 'Qwiktransfers Canada'}</div>
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                        <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Payment Reference</label>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            letterSpacing: '2px',
                                            color: 'var(--accent-peach)',
                                            border: '1px dashed rgba(255,255,255,0.3)'
                                        }}>
                                            {adminReference}
                                        </div>
                                        <p style={{ fontSize: '0.7rem', marginTop: '8px', textAlign: 'center', opacity: 0.7 }}>
                                            Include this code in your transfer for faster tracking.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button variant="outline" onClick={prevStep} style={{ flex: 1 }}>Back</Button>
                                    <Button onClick={handleSend} style={{ flex: 2 }}>Confirm & Send</Button>
                                </div>
                            </div>
                        )}

                        {formStep === 4 && (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ width: '64px', height: '64px', background: 'var(--success)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
                                    ✓
                                </div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Transfer Initiated!</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                    Your exchange rate is securely <strong>locked</strong>. Please complete your payment now.
                                </p>

                                <div style={{ background: 'var(--text-deep-brown)', color: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '0.85rem', margin: 0, color: 'var(--accent-peach)' }}>PAYMENT INSTRUCTIONS</h3>
                                        <RateLockTimer lockedUntil={rateLockedUntil} />
                                    </div>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '20px' }}>
                                        Send <strong>{amount} {fromCurrency}</strong> to:
                                    </p>

                                    <div style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
                                        {fromCurrency === 'GHS' ? (
                                            <>
                                                <div style={{ marginBottom: '6px' }}><strong>MTN Momo:</strong> {ghsPaymentMethod?.number || '055 123 4567'}</div>
                                                <div><strong>Name:</strong> {ghsPaymentMethod?.name || 'Qwiktransfers Limited'}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ marginBottom: '6px' }}><strong>Interac:</strong> {cadPaymentMethod?.email || 'pay@qwiktransfers.ca'}</div>
                                                <div><strong>Name:</strong> {cadPaymentMethod?.name || 'Qwiktransfers Canada'}</div>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.3)', textAlign: 'center' }}>
                                        <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Reference Code</label>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-peach)', letterSpacing: '1px' }}>{adminReference}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Button onClick={resetForm}>Send Another Transfer</Button>
                                    <Button variant="outline" onClick={() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); resetForm(); }}>
                                        View History
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>


                    <RateWatchCard />

                    <section className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Verification Status</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {user?.is_email_verified ? (
                                    <span className="badge badge-processing">EMAIL ✓</span>
                                ) : (
                                    <span className="badge badge-pending">EMAIL ⚠</span>
                                )}
                                {user?.kyc_status === 'verified' ? (
                                    <span className="badge badge-processing">ID ✓</span>
                                ) : (
                                    <span className="badge badge-pending">ID {user?.kyc_status?.toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>${user?.limits?.daily || 50} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Daily Limit</span></span>
                                <Link to="/kyc" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Increase Limit</Link>
                            </div>
                            <div style={{ height: '8px', background: 'var(--accent-peach)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <div
                                    className={loading ? 'shimmer-bar' : ''}
                                    style={{
                                        height: '100%',
                                        width: user?.limits ? '10%' : '0%',
                                        background: 'var(--primary)',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }}
                                ></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                                {!user?.is_email_verified && `Verify your email to increase limit to $${user?.limits?.tiers?.level2 || 500}.`}
                                {user?.is_email_verified && user?.kyc_status !== 'verified' && `Complete KYC to increase limit to $${user?.limits?.tiers?.level3 || 5000}.`}
                                {user?.kyc_status === 'verified' && "You have the maximum daily limit."}
                            </p>
                        </div>
                    </section>
                </aside>

                <section className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                    <TransactionAnalytics data={userStats} loading={statsLoading} />

                    <div style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Transaction History</h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '220px' }}>
                                <Input
                                    placeholder="Search transactions..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    style={{ padding: '8px 12px' }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowExportModal(true)}
                                style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', height: '42px', marginTop: '-15px' }}
                            >
                                Export CSV
                            </Button>
                        </div>
                    </div>
                    {isHistoryLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                            <div className="spinner"></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px' }}>Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>No transactions found.</p>
                    ) : (
                        <table style={{ marginTop: '0' }}>
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} onClick={() => openDetails(tx)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{tx.transaction_id}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {tx.createdAt}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{tx.recipient_details?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {tx.recipient_details?.momo_provider || tx.recipient_details?.bank_name || tx.recipient_details?.type} • {tx.recipient_details?.account || tx.recipient_details?.interac_email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{tx.amount_received} {tx.type.split('-')[1]}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.amount_sent} {tx.type.split('-')[0]}</div>
                                        </td>
                                        <td>
                                            {tx.rejection_reason ? (
                                                <span className="status-badge pending" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                                                    Rejected
                                                </span>
                                            ) : (
                                                <span className={`badge badge-${tx.status}`}>
                                                    {tx.status}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                            {tx.status === 'pending' && !tx.proof_url && (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => handleUploadProof(tx.id, e.target.files[0])}
                                                        style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Upload Proof</span>
                                                </div>
                                            )}
                                            {tx.proof_url && (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(getImageUrl(tx.proof_url));
                                                        setPreviewDate(tx.proof_uploaded_at);
                                                        setShowPreviewModal(true);
                                                    }}
                                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    View Proof
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isHistoryLoading && totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '48px',
                            padding: '24px 32px',
                            borderTop: '1px solid var(--border-color)',
                            background: 'var(--accent-peach)',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Showing page {page} of {totalPages} ({totalTransactions} transactions)
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    style={{ padding: '8px 20px', fontSize: '0.85rem', width: 'auto' }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    style={{ padding: '8px 20px', fontSize: '0.85rem', width: 'auto' }}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="modal-overlay" style={{ zIndex: 12000 }}>
                    <div className="modal-content glass" style={{ maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Security Verification</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                                {pinAction?.type === 'cancel'
                                    ? 'Authorize the cancellation of this transfer.'
                                    : 'Enter your 4-digit security PIN to proceed.'}
                            </p>
                        </div>

                        <form onSubmit={handlePinSubmit}>
                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <input
                                    type="password"
                                    maxLength="4"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '2.5rem',
                                        letterSpacing: '16px',
                                        width: '100%',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-deep-brown)',
                                        borderRadius: '16px',
                                        padding: '20px 0'
                                    }}
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button type="button" variant="outline" onClick={() => setShowPinModal(false)} style={{ flex: 1, padding: '16px' }}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={loading} style={{ flex: 1, padding: '16px' }}>
                                    Verify
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Details Modal (Premium Redesign) */}
            {showDetailsModal && selectedTx && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="card fade-in" style={{ padding: '0', maxWidth: '650px', width: '95%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header/Upper Section */}
                        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)' }}>Transaction Breakdown</h1>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button 
                                        onClick={async () => await generateReceiptPDF(selectedTx, systemBranding.name, systemBranding.base64Logo)}
                                        className="btn btn-sm"
                                        style={{ 
                                            background: 'var(--primary)', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '8px 16px', 
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span>Download Receipt</span>
                                        <span>📄</span>
                                    </button>
                                    <button onClick={() => setShowDetailsModal(false)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}>×</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Reference</label>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>#{selectedTx.transaction_id.toUpperCase()}</h2>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label>
                                    <span className={`status-badge ${selectedTx.status}`} style={{ margin: 0, padding: '8px 20px', borderRadius: '30px' }}>{selectedTx.status}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Initiated At</label>
                                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(selectedTx.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedTx.status === 'sent' && (
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Sent Date</label>
                                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>{new Date(selectedTx.updatedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {selectedTx.rejection_reason && (
                                <div style={{
                                    marginTop: '24px',
                                    background: 'rgba(220, 38, 38, 0.05)',
                                    border: '1px dashed #dc2626',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: '2px' }}>Vendor Feedback</label>
                                        <p style={{ color: 'var(--text-deep-brown)', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.4 }}>
                                            {selectedTx.rejection_reason}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-body" style={{ padding: '24px 32px 32px' }}>
                            {/* Financial Summary Card */}
                            <div style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px' }}>Financial Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Currency Pair</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selectedTx.type?.split('-')[0]} → {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Exchange Rate</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                            1 {selectedTx.type?.split('-')[0]} = {(selectedTx.amount_received / selectedTx.amount_sent).toFixed(4)} {selectedTx.type?.split('-')[1]}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amount Sent</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.4rem' }}>{selectedTx.amount_sent} {selectedTx.type?.split('-')[0]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>To Recipient</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>{selectedTx.amount_received} {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient Details Card */}
                            <div style={{
                                background: 'rgba(0,0,0,0.015)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Details</h4>
                                    <span style={{
                                        background: 'var(--secondary)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}>
                                        {selectedTx.recipient_details?.type || 'Bank'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                                        <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.name || 'N/A'}</span>
                                    </div>

                                    {selectedTx.recipient_details?.type === 'momo' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Provider:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.momo_provider || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Wallet / Phone:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.account || selectedTx.recipient_details?.phone || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'bank' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Bank Name:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.bank_name || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Account Number:</span>
                                                <span style={{ fontWeight: 700, letterSpacing: '1px' }}>{selectedTx.recipient_details?.account || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Transit Number:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.transit_number || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.institution_number || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'interac' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Interac Email:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.interac_email || 'N/A'}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Admin Payment Reference:</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedTx.admin_reference || selectedTx.recipient_details?.admin_reference || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedTx.recipient_details?.note && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Your Note</h4>
                                    <div style={{
                                        padding: '16px 20px',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--border-color)',
                                        background: 'rgba(0,0,0,0.01)',
                                        fontStyle: 'italic',
                                        color: 'var(--secondary)'
                                    }}>
                                        "{selectedTx.recipient_details.note}"
                                    </div>
                                </div>
                            )}

                            {/* Vendor Proof Section */}
                            {selectedTx.status === 'sent' && selectedTx.vendor_proof_url && (
                                <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(34, 197, 94, 0.05)', border: '1px dashed var(--success)', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Vendor has uploaded proof of payment.</p>
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => {
                                            const url = selectedTx.vendor_proof_url;
                                            setPreviewImage(url.startsWith('http') ? url : getImageUrl(url));
                                            setPreviewDate(selectedTx.updatedAt);
                                            setShowPreviewModal(true);
                                        }}
                                        style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                                    >
                                        View Fulfillment Proof
                                    </Button>
                                </div>
                            )}

                            {/* User Proof Section */}
                            {selectedTx.status === 'pending' && !selectedTx.proof_url && (
                                <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(183, 71, 42, 0.05)', border: '1px dashed var(--primary)', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-deep-brown)', fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Awaiting your payment proof to process this transfer.</p>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleUploadProof(selectedTx.id, e.target.files[0])}
                                            style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', top: 0, left: 0, zIndex: 10 }}
                                        />
                                        <Button type="button" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                                            Upload Payment Proof
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* User Actions */}
                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                <Button variant="outline" onClick={() => setShowDetailsModal(false)} style={{ flex: 1 }}>Close Modal</Button>
                                {selectedTx.status === 'pending' && !selectedTx.proof_url && (
                                    <button
                                        onClick={() => handleCancelTransaction(selectedTx.id)}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            flex: 1,
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseOver={e => e.target.style.background = '#fef2f2'}
                                        onMouseOut={e => e.target.style.background = '#fee2e2'}
                                    >
                                        Cancel Transaction
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showPreviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, backdropFilter: 'blur(10px)' }}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} className="fade-in">
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem' }}
                        >
                            &times;
                        </button>
                        {previewImage.endsWith('.pdf') ? (
                            <iframe src={previewImage} style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: '12px' }} title="Proof PDF"></iframe>
                        ) : (
                            <img
                                src={previewImage}
                                alt="Payment Proof"
                                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            />
                        )}
                        {previewDate && (
                            <div style={{ position: 'absolute', bottom: '-40px', left: 0, width: '100%', textAlign: 'center', color: 'white', fontWeight: 600 }}>
                                Uploaded on: {new Date(previewDate).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showExportModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ marginBottom: '8px' }}>Export Transactions</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Download your transaction history as a CSV file.</p>

                        <div className="form-group">
                            <label>Start Date (Optional)</label>
                            <input
                                type="date"
                                value={exportDates.start}
                                onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date (Optional)</label>
                            <input
                                type="date"
                                value={exportDates.end}
                                onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Button variant="outline" onClick={() => setShowExportModal(false)} style={{ flex: 1 }}>Cancel</Button>
                            <Button onClick={handleExport} style={{ flex: 1 }}>Download CSV</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
