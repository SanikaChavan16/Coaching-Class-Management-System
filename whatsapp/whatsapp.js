const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join('/tmp', '.wwebjs_auth') // ✅ Stores session in Render's writable directory
    }),
    puppeteer: {
        headless: 'new', // ✅ Fully headless for Render
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer'
        ]
    }
});

client.initialize();

// ✅ Ensure Client is Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready!');
});

client.on('qr', qr => {
    console.log('📸 Scan this QR Code to log in:', qr);
});

client.on('authenticated', () => {
    console.log('🔓 WhatsApp Client Authenticated!');
});

client.on('auth_failure', msg => {
    console.error("❌ Authentication Failed! Reason:", msg);
});

client.on('disconnected', (reason) => {
    console.error("🔴 WhatsApp Web Disconnected! Reason:", reason);
    client.destroy();
    setTimeout(() => client.initialize(), 5000); // ✅ Auto-reconnect after 5 sec
});

// ✅ Send WhatsApp Message Function
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

module.exports = { client, sendMessage };
