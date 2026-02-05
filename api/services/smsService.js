const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

const sendSMS = async (to, body) => {
    if (!client) {
        console.warn('Twilio client not initialized. Skipping SMS.');
        return;
    }
    try {
        await client.messages.create({
            body: `QWIK: ${body}`,
            from: fromNumber,
            to
        });
    } catch (error) {
        console.error('SMS sending failed:', error);
    }
};

module.exports = { sendSMS };
