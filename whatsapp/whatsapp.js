const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const sessionPath = path.join(__dirname, 'wwebjs_auth');  // Store session data locally

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: sessionPath }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer'
        ]
    }
});

client.on('qr', qr => {
    console.log('⚠️ QR Code generated! Scan to log in.');  // Show only one message, no QR flood
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready!');
});

client.on('authenticated', () => {
    console.log('🔓 WhatsApp Client Authenticated!');
});

client.on('auth_failure', msg => {
    console.error("❌ Authentication Failed! Reason:", msg);
});

client.on('disconnected', reason => {
    console.error("🔴 WhatsApp Web Disconnected! Reason:", reason);
    console.log("♻️ Reconnecting...");
    client.initialize();  // Auto-reconnect
});

// ✅ Function to Send WhatsApp Messages
const sendMessage = async (phone, message) => {
    try {
        if (!client.info) {
            console.error("❌ WhatsApp Client not initialized! Please wait.");
            return;
        }

        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.startsWith('91')) {
            formattedPhone = `91${formattedPhone}`;
        }
        formattedPhone = `${formattedPhone}@c.us`;

        await client.sendMessage(formattedPhone, message);
        console.log(`✅ Message sent to ${phone}`);
    } catch (error) {
        console.error(`❌ Error sending message to ${phone}:`, error);
    }
};

client.initialize();

module.exports = { client, sendMessage };
