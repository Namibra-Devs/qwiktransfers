import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Share,
    ActivityIndicator,
    StatusBar,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { toast } from '../utils/toast'; // Assuming a toast utility exists or using alert

const ReferralScreen = ({ navigation }) => {
    const { user, getReferralStats, getReferredUsers } = useAuth();
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [referredUsers, setReferredUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, usersData] = await Promise.all([
                getReferralStats(),
                getReferredUsers()
            ]);
            setStats(statsData);
            setReferredUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const code = stats?.referral_code || 'QWIK-XXXX';
            await Share.share({
                message: `Join me on QwikTransfers! Use my referral code ${code} to get rewards on your first transfer. Download now: https://qwiktransfers.com/download`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const renderUser = ({ item }) => (
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.userInfo}>
                <View style={[styles.userAvatar, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>{item.name.charAt(0)}</Text>
                </View>
                <View>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.userDate, { color: theme.textMuted }]}>Joined {new Date(item.joinedAt).toLocaleDateString()}</Text>
                </View>
            </View>
            <View style={[
                styles.statusBadge, 
                { backgroundColor: item.status === 'Completed First TX' ? '#10b98120' : '#f59e0b20' }
            ]}>
                <Text style={[
                    styles.statusText, 
                    { color: item.status === 'Completed First TX' ? '#10b981' : '#f59e0b' }
                ]}>
                    {item.status === 'Completed First TX' ? 'Completed' : 'Pending'}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const pendingAmount = stats?.rewards?.find(r => r.status === 'pending')?.total_amount || 0;
    const earnedAmount = stats?.rewards?.find(r => r.status === 'paid')?.total_amount || 0;
    const currency = stats?.rewards?.[0]?.reward_currency || 'GHS';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
            
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Refer & Earn</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
                    <Ionicons name="gift-outline" size={60} color="#fff" style={styles.heroIcon} />
                    <Text style={styles.heroTitle}>Invite Friends, Get Rewards</Text>
                    <Text style={styles.heroSubtitle}>Share your code and earn bonuses when friends make their first transfer.</Text>
                    
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                        <View style={styles.codeRow}>
                            <Text style={styles.codeText}>{stats?.referral_code || 'QWIK-XXXX'}</Text>
                            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                                <Ionicons name="share-social" size={20} color={theme.primary} />
                                <Text style={[styles.shareBtnText, { color: theme.primary }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats?.total_referrals || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Friends</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: '#f59e0b' }]}>{pendingAmount} {currency}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pending</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: '#10b981' }]}>{earnedAmount} {currency}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Earned</Text>
                    </View>
                </View>

                {/* List Title */}
                <Text style={[styles.listTitle, { color: theme.text }]}>Referred Friends</Text>
                
                {referredUsers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={theme.textMuted} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No referrals yet. Start sharing!</Text>
                    </View>
                ) : (
                    referredUsers.map(user => (
                        <View key={user.id} style={{ marginBottom: 12 }}>
                            {renderUser({ item: user })}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    scrollContent: { padding: 20 },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    heroIcon: { marginBottom: 16 },
    heroTitle: { color: '#fff', fontSize: 22, fontFamily: 'Outfit_700Bold', textAlign: 'center' },
    heroSubtitle: { color: '#ffffffcc', fontSize: 14, fontFamily: 'Outfit_400Regular', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    codeContainer: {
        width: '100%',
        backgroundColor: '#ffffff20',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ffffff40',
    },
    codeLabel: { color: '#ffffffcc', fontSize: 10, fontFamily: 'Outfit_700Bold', letterSpacing: 1, marginBottom: 8 },
    codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    codeText: { color: '#fff', fontSize: 24, fontFamily: 'Outfit_900Black', letterSpacing: 2 },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6
    },
    shareBtnText: { fontSize: 14, fontFamily: 'Outfit_700Bold' },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statItem: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statValue: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    statLabel: { fontSize: 12, fontFamily: 'Outfit_400Regular', marginTop: 4 },
    listTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold', marginBottom: 16 },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    userName: { fontSize: 16, fontFamily: 'Outfit_600SemiBold' },
    userDate: { fontSize: 12, fontFamily: 'Outfit_400Regular' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontFamily: 'Outfit_700Bold' },
    emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 14, fontFamily: 'Outfit_400Regular' }
});

export default ReferralScreen;
