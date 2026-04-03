import React, { useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

const ConnectivityManager = () => {
    const [isConnected, setIsConnected] = useState(true);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Immediate check on mount
        NetInfo.fetch().then(state => {
            const currentStatus = !!state.isConnected;
            setIsConnected(currentStatus);
            if (!currentStatus) {
                showOfflineToast();
            }
        });

        const unsubscribe = NetInfo.addEventListener(state => {
            const currentStatus = !!state.isConnected;
            
            if (currentStatus !== isConnected) {
                if (currentStatus) {
                    Toast.hide(); // Hide any stuck offline toast
                    Toast.show({
                        type: 'success',
                        text1: 'Internet Restored',
                        text2: 'You are back online.',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                } else {
                    showOfflineToast();
                }
                setIsConnected(currentStatus);
            }
        });

        return () => unsubscribe();
    }, [isConnected]);

    const showOfflineToast = () => {
        Toast.show({
            type: 'error',
            text1: 'No Internet Connection',
            text2: 'Please check your network settings.',
            position: 'top',
            autoHide: false,
        });
    };

    return null;
};

export default ConnectivityManager;
