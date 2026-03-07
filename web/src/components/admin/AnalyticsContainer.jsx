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
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsContainer = ({ stats }) => {
    if (!stats || !stats.history) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics data...</div>;

    const { volume, transactions, users } = stats.history;

    // Helper to format date
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Prepare Volume Data (CAD vs GHS)
    const dates = [...new Set(volume.map(v => v.date))].sort();
    const volumeData = {
        labels: dates.map(formatDate),
        datasets: [
            {
                label: 'CAD Volume',
                data: dates.map(d => {
                    const match = volume.find(v => v.date === d && v.type.startsWith('CAD'));
                    return match ? parseFloat(match.total_sent) : 0;
                }),
                borderColor: '#b7472a',
                backgroundColor: 'rgba(183, 71, 42, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'GHS Volume (Ref CAD)',
                data: dates.map(d => {
                    const match = volume.find(v => v.date === d && v.type.startsWith('GHS'));
                    return match ? parseFloat(match.total_sent) * 0.1 : 0; // Estimated reference
                }),
                borderColor: '#210a08',
                backgroundColor: 'rgba(33, 10, 8, 0.05)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Prepare Transaction Count Data
    const txDates = transactions.map(t => t.date);
    const txCountData = {
        labels: txDates.map(formatDate),
        datasets: [{
            label: 'Daily Transactions',
            data: transactions.map(t => t.count),
            backgroundColor: 'var(--primary)',
            borderRadius: 6
        }]
    };

    // Prepare User Growth Data
    const userDates = users.map(u => u.date);
    const userGrowthData = {
        labels: userDates.map(formatDate),
        datasets: [{
            label: 'New Users',
            data: users.map(u => u.count),
            borderColor: '#059669',
            backgroundColor: '#059669',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.1
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { font: { weight: 'bold' } } },
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="analytics-dashboard fade-in">
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Growth Metric</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: stats.volumeGrowth >= 0 ? '#059669' : '#d83b01', background: stats.volumeGrowth >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(216, 59, 1, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {stats.volumeGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.volumeGrowth)}%
                        </span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>MoM Volume</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>Compared to previous month average</p>
                </div>

                <div className="card" style={{ padding: '24px', borderLeft: '4px solid #059669' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Acquisition</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{users.reduce((a, b) => a + parseInt(b.count), 0)}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>New users in last 30 days</p>
                </div>

                <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Efficiency</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{(transactions.reduce((a, b) => a + parseInt(b.count), 0) / (users.reduce((a, b) => a + parseInt(b.count), 0) || 1)).toFixed(1)}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>TX per new user ratio</p>
                </div>

                <div className="card" style={{ padding: '24px', borderLeft: '4px solid #b7472a', background: 'rgba(183, 71, 42, 0.05)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Est. Revenue (CAD)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b7472a' }}>${stats.totalProfit || '0.00'}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>Total margin from sent transactions</p>
                </div>
            </div>

            <div style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/transactions/admin/stats/export`, '_blank')}
                    className="btn btn-secondary"
                    style={{ background: '#fff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    📥 Export Full Analytics (XLSX)
                </button>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Transaction Volume Trend</h3>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'help' }))}
                            style={{ background: 'var(--bg-peach)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 800 }}
                        >
                            ?
                        </button>
                    </div>
                    <Line data={volumeData} options={chartOptions} />
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Daily Transaction Activity</h3>
                    <Bar data={txCountData} options={chartOptions} />
                </div>

                <div className="card" style={{ padding: '32px', gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>User Registration Growth</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={userGrowthData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsContainer;
