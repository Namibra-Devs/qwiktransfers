import 'dotenv/config';

export default {
    expo: {
        name: "QwikTransfers",
        slug: "qwiktransfers",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/logo-red.png",
        userInterfaceStyle: "light",
        newArchEnabled: false,
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#DC2626"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/logo-red.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            package: "com.anonymous.mobile",
            usesCleartextTraffic: true
        },
        web: {
            favicon: "./assets/logo-red.png"
        },
        runtimeVersion: {
            policy: "appVersion"
        },
        updates: {
            url: "https://u.expo.dev/7489686b-bc77-4483-b54c-2cde26d23842"
        },
        plugins: [
            "expo-font"
        ],
        extra: {
            apiUrl: process.env.API_URL ? (process.env.API_URL + '/api') : 'http://localhost:5000/api',
            eas: {
                projectId: "7489686b-bc77-4483-b54c-2cde26d23842"
            }
        }
    }
};
