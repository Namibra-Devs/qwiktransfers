let Expo;

const getExpoClient = async () => {
    if (!Expo) {
        const sdk = await import('expo-server-sdk');
        Expo = sdk.Expo;
    }
    return new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
};

const sendPushMessage = async (pushToken, title, body, data = {}) => {
    try {
        const expo = await getExpoClient();

        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return false;
        }

        // Construct a message
        const messages = [{
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }];

        let ticketChunk = await expo.sendPushNotificationsAsync(messages);
        return ticketChunk;
    } catch (error) {
        console.error('Error sending push notification', error);
        return false;
    }
};

module.exports = {
    sendPushMessage
};
