import 'dotenv/config';

// const productionUrl = 'http://uowkkskssoo0k8cccg00ssks.161.97.80.67.sslip.io';
const productionUrl = 'http://161.97.80.67';

export default {
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
            // backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: "com.anonymous.mobile",
        usesCleartextTraffic: true,
        permissions: ["INTERNET"]
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
        "expo-font",
        [
            "expo-build-properties",
            {
                "android": {
                    "usesCleartextTraffic": true
                }
            }
        ]
    ],
    extra: {
        apiUrl: (process.env.API_URL || productionUrl) + '/api',
        eas: {
            projectId: "7489686b-bc77-4483-b54c-2cde26d23842"
        }
    }
};
