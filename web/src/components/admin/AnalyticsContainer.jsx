import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsContainer = ({ stats }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        const toastId = toast.loading('Generating Intelligence Report...');
        
        try {
            const response = await api.get('/transactions/admin/stats/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `intelligence_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Report successfully exported', { id: toastId });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export report', { id: toastId });
        } finally {
            setExporting(false);
        }
    };

    if (!stats || !stats.history) return (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '24px', margin: '20px' }} className="glass">
            <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '3px solid rgba(183, 71, 42, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Assembling business intelligence...</p>
        </div>
    );

    const { volume, transactions, users, profit } = stats.history;

    // Helper to format date
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Helper to format currency
    const formatCurrency = (val, currency = 'CAD') => {
        return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(val);
    };

    // 1. Profitability Trend Data (New)
    const profitData = {
        labels: profit.map(p => formatDate(p.date)),
        datasets: [{
            label: 'Daily Profit (CAD)',
            data: profit.map(p => p.profit),
            borderColor: '#b7472a',
            backgroundColor: 'rgba(183, 71, 42, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#b7472a'
        }]
    };

    // 2. Payment Method Distribution (New)
    const methodData = {
        labels: stats.methodCounts.map(m => (m.method || 'General').toUpperCase()),
        datasets: [{
            data: stats.methodCounts.map(m => m.count),
            backgroundColor: ['#b7472a', '#210a08', '#059669', '#d97706'],
            borderWidth: 0,
            hoverOffset: 12
        }]
    };

    // 3. Top Vendors / Customers Data (New)
    const topVendorData = {
        labels: stats.topVendors.map(v => `${v.vendor?.first_name || 'Vendor'} ${v.vendor?.last_name?.charAt(0) || ''}.`),
        datasets: [{
            label: 'Volume processed',
            data: stats.topVendors.map(v => v.total_volume),
            backgroundColor: '#210a08',
            borderRadius: 8,
            barThickness: 20
        }]
    };

    const topCustomerData = {
        labels: stats.topCustomers.map(c => `${c.user?.first_name || 'User'} ${c.user?.last_name?.charAt(0) || ''}.`),
        datasets: [{
            label: 'Total Sent',
            data: stats.topCustomers.map(c => c.total_volume),
            backgroundColor: '#b7472a',
            borderRadius: 8,
            barThickness: 20
        }]
    };

    // Legacy Volume Data (Consolidated)
    const dates = [...new Set(volume.map(v => v.date))].sort();
    const volumeData = {
        labels: dates.map(formatDate),
        datasets: [
            {
                label: 'Volume (CAD Equiv)',
                data: dates.map(d => {
                    const CAD = volume.find(v => v.date === d && v.type.startsWith('CAD'));
                    const GHS = volume.find(v => v.date === d && v.type.startsWith('GHS'));
                    let total = 0;
                    if (CAD) total += parseFloat(CAD.total_sent);
                    if (GHS) total += parseFloat(GHS.total_sent) * 0.1; // Simple reference for visual
                    return total;
                }),
                borderColor: '#210a08',
                backgroundColor: 'rgba(33, 10, 8, 0.05)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { weight: 'bold', family: 'Inter' }, usePointStyle: true } },
            tooltip: { backgroundColor: 'rgba(33, 10, 8, 0.9)', padding: 12, bodySpacing: 6, titleMarginBottom: 8 }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } }
        }
    };

    return (
        <div className="analytics-dashboard fade-in" style={{ padding: '0 0 40px' }}>
            {/* KPI Cards Row 1: High Level */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass card" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(183, 71, 42, 0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>monitoring</span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: stats.volumeGrowth >= 0 ? '#059669' : '#d83b01', background: stats.volumeGrowth >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(216, 59, 1, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                            {stats.volumeGrowth >= 0 ? '+' : ''}{stats.volumeGrowth}%
                        </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>MTD Volume Growth</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>{stats.volumeGrowth >= 0 ? 'Thriving' : 'Declining'}</div>
                </div>

                <div className="glass card" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '24px' }}>
                    <div style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>group_add</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>New Acquisitions</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669' }}>{users.reduce((a, b) => a + parseInt(b.count), 0)}</div>
                </div>

                <div className="glass card" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '24px' }}>
                    <div style={{ background: 'rgba(183, 71, 42, 0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>payments</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Est. Net Profit</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>{formatCurrency(stats.totalProfit, 'CAD')}</div>
                </div>
            </div>

            {/* User Requested: Currency Breakdown Section */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>account_balance_wallet</span>
                    Real-time Currency Liquidity
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', border: '1px solid rgba(183,71,42,0.1)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>SENT GHS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b7472a' }}>{formatCurrency(stats.sentGHS, 'GHS')}</div>
                    </div>
                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', border: '1px solid rgba(183,71,42,0.1)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>SENT CAD</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#210a08' }}>{formatCurrency(stats.sentCAD, 'CAD')}</div>
                    </div>
                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', border: '1px solid rgba(183,71,42,0.1)', background: 'rgba(217, 119, 6, 0.05)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>PENDING GHS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706' }}>{formatCurrency(stats.pendingGHS, 'GHS')}</div>
                    </div>
                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', border: '1px solid rgba(183,71,42,0.1)', background: 'rgba(217, 119, 6, 0.05)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>PENDING CAD</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706' }}>{formatCurrency(stats.pendingCAD, 'CAD')}</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div className="glass card" style={{ padding: '32px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px' }}>Profitability & Revenue Trend</h3>
                    <div style={{ height: '350px' }}>
                        <Line data={profitData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass card" style={{ padding: '32px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px' }}>Payout Methods</h3>
                    <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={methodData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                <div className="glass card" style={{ padding: '32px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Top Performing Vendors</h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>BY SENT VOLUME</span>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Bar data={topVendorData} options={{ ...chartOptions, indexAxis: 'y' }} />
                    </div>
                </div>

                <div className="glass card" style={{ padding: '32px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Top Value Customers</h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>BY TOTAL TRANSFERS</span>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Bar data={topCustomerData} options={{ ...chartOptions, indexAxis: 'y' }} />
                    </div>
                </div>
            </div>

            <div className="glass card" style={{ padding: '32px', borderRadius: '24px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px' }}>Daily Activity Volume</h3>
                <div style={{ height: '300px' }}>
                    <Bar data={{
                        labels: transactions.map(t => formatDate(t.date)),
                        datasets: [{
                            label: 'Number of Transactions',
                            data: transactions.map(t => t.count),
                            backgroundColor: '#210a08',
                            borderRadius: 6
                        }]
                    }} options={chartOptions} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="complete-cta"
                    style={{ width: 'auto', padding: '16px 40px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', opacity: exporting ? 0.7 : 1, cursor: exporting ? 'not-allowed' : 'pointer' }}
                >
                    <span className="material-symbols-outlined">analytics</span>
                    {exporting ? 'Generating Report...' : 'Export Detailed Intelligence Report (XLSX)'}
                </button>
            </div>
        </div>
    );
};

export default AnalyticsContainer;
