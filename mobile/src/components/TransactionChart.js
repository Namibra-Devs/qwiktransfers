import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import ShimmerPlaceholder from './ShimmerPlaceholder';

const { width } = Dimensions.get('window');

const TransactionChart = ({ data, loading }) => {
    const theme = useTheme();

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

    const volumeHistory = data?.history?.volume || [];
    const labels = volumeHistory.map(h => {
        const d = new Date(h.date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const chartData = {
        labels: labels.length > 0 ? labels.filter((_, i) => i % 5 === 0) : ['N/A'], 
        datasets: [
            {
                data: volumeHistory.length > 0 ? volumeHistory.map(h => parseFloat(h.total_sent || 0)) : [0],
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
            strokeOpacity: 0.2
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Transaction Insights</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Last 30 days activity</Text>
                </View>
                <View style={styles.kpiRow}>
                    <View style={styles.kpiItem}>
                        <Text style={[styles.kpiValue, { color: theme.text }]}>
                            {data?.totalSentCount || 0}
                        </Text>
                        <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Count</Text>
                    </View>
                </View>
            </View>

            {volumeHistory.length > 0 ? (
                <LineChart
                    data={chartData}
                    width={width - 40}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={true}
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
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 40, // Ensure labels are visible
    },
    chartPlaceholder: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        marginTop: 10,
    }
});

export default TransactionChart;
