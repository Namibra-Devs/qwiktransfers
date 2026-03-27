import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import ShimmerPlaceholder from './ShimmerPlaceholder';

const { width } = Dimensions.get('window');

const TransactionChart = ({ data, loading }) => {
    const theme = useTheme();
    const [tooltipData, setTooltipData] = useState(null);

    if (loading || !data) {
        return (
            <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.header}>
                    <ShimmerPlaceholder style={{ width: 140, height: 18, marginBottom: 8 }} />
                    <ShimmerPlaceholder style={{ width: 100, height: 12 }} />
                </View>
                <ShimmerPlaceholder style={styles.chartPlaceholder} />
            </View>
        );
    }

    const volumeHistoryRaw = data?.history?.volume || [];

    // Generate the last 30 days array to ensure the graph is always full
    const volumeHistory = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        // Match day/month/year to avoid timezone drift
        const record = volumeHistoryRaw.find(r => {
            const rDate = new Date(r.date);
            return rDate.getDate() === d.getDate() &&
                rDate.getMonth() === d.getMonth() &&
                rDate.getFullYear() === d.getFullYear();
        });

        volumeHistory.push({
            rawDate: d,
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            total_sent: record ? parseFloat(record.total_sent || 0) : 0
        });
    }

    console.log('Rendering Chart with Data Points:', volumeHistory.length);

    const labels = volumeHistory.map(h => h.label);

    const chartData = {
        labels: labels.map((l, i) => (i % 6 === 0 ? l : ' ')), // Show label every ~6 days
        datasets: [
            {
                data: volumeHistory.map(h => h.total_sent),
                color: (opacity = 1) => `rgba(183, 71, 42, ${opacity})`, // Brand Primary
                strokeWidth: 2
            }
        ]
    };

    const chartConfig = {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(183, 71, 42, ${opacity})`,
        labelColor: (opacity = 1) => theme.textMuted,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#B7472A"
        },
        propsForBackgroundLines: {
            strokeDasharray: "", // solid background lines
            stroke: theme.border,
            strokeOpacity: 0.1
        },
        paddingTop: 16,
        paddingRight: 16,
        paddingLeft: 32, // Extra space if labels are there, or keep it consistent
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Transaction Insights</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Last 30 days activity</Text>
                </View>
                {tooltipData ? (
                    <View style={[styles.tooltipHeader, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.tooltipValue, { color: theme.primary }]}>
                            ₵{tooltipData.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Text>
                        <Text style={[styles.tooltipDate, { color: theme.primary }]}>{tooltipData.label}</Text>
                    </View>
                ) : (
                    <View style={styles.kpiRow}>
                        <View style={styles.kpiItem}>
                            <Text style={[styles.kpiValue, { color: theme.text }]}>
                                {data?.totalSentCount || 0}
                            </Text>
                            <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Count</Text>
                        </View>
                    </View>
                )}
            </View>

            {volumeHistory.length > 0 ? (
                <LineChart
                    key={`chart-${volumeHistory.length}-${theme.isDark}`}
                    data={chartData}
                    width={width - 80}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={false}
                    fromZero={true}
                    onDataPointClick={(point) => {
                        const d = volumeHistory[point.index].rawDate;
                        setTooltipData({
                            value: point.value,
                            label: `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                        });
                    }}
                />
            ) : (
                <View style={[styles.chartPlaceholder, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]}>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>No activity data yet</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
    },
    kpiRow: {
        alignItems: 'flex-end',
    },
    kpiItem: {
        alignItems: 'center',
    },
    kpiValue: {
        fontSize: 14,
        fontFamily: 'Outfit_700Bold',
    },
    kpiLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tooltipHeader: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'flex-end',
        minWidth: 90,
    },
    tooltipValue: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
    },
    tooltipDate: {
        fontSize: 10,
        fontFamily: 'Outfit_600SemiBold',
        textTransform: 'uppercase',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 10,
        paddingLeft: 10,
    },
    chartPlaceholder: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        marginTop: 10,
    }
});

export default TransactionChart;
