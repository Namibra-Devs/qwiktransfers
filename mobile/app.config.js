import 'dotenv/config';

// const productionUrl = 'http://uowkkskssoo0k8cccg00ssks.161.97.80.67.sslip.io';
const productionUrl = 'http://161.97.80.67';

export default {
    name: "QwikTransfers",
    slug: "qwiktransfers",
    owner: "namibra",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
        image: "./assets/name-logo.png",
        resizeMode: "contain",
        backgroundColor: "#DC2626"
    },
    ios: {
        supportsTablet: true
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/icon.png",
            backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: "com.namibra.qwiktransfers",
        usesCleartextTraffic: true,
        permissions: ["INTERNET"]
    },
    web: {
        favicon: "./assets/icon.png"
    },
    runtimeVersion: {
        policy: "appVersion"
    },
    updates: {
        url: "https://u.expo.dev/d8a066d8-caf6-4510-9aa1-986d97c618c2"
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
            projectId: "d8a066d8-caf6-4510-9aa1-986d97c618c2"
        }
    }
};
