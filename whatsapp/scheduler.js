const cron = require('node-cron');
const { sendMessage, isClientReady } = require('./whatsapp');

const scheduledTasks = {}; // Store scheduled jobs

// ✅ Function to Schedule Messages
function scheduleMessage(phone, message, date, time) {
    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        // ✅ Validate date and time
        if (!year || !month || !day || !hour || !minute) {
            console.error(`❌ Invalid date/time for scheduling: ${date} ${time}`);
            return;
        }

        // ✅ Ensure date is in the future
        const jobDate = new Date(year, month - 1, day, hour, minute, 0); // Month is 0-based in JS
        if (jobDate <= new Date()) {
            console.error(`⚠️ Cannot schedule past date/time: ${date} ${time}`);
            return;
        }

        // ✅ Convert to correct cron format: "minute hour day month *"
        const cronTime = `${minute} ${hour} ${day} ${month} *`;

        // ✅ Stop any previous task for this phone number
        if (scheduledTasks[phone]) {
            scheduledTasks[phone].stop();
            console.log(`🔄 Overwriting previous reminder for ${phone}`);
        }

        console.log(`📅 Scheduling reminder for ${phone} at ${jobDate.toLocaleString()}`);

        // ✅ Schedule the message
        const task = cron.schedule(cronTime, async () => {
            if (!isClientReady()) {
                console.error("❌ WhatsApp Client not initialized! Skipping message.");
                return;
            }

            console.log(`📢 Sending reminder to ${phone}`);
            await sendMessage(phone, message);
            task.stop(); // ✅ Stop the task after execution
            delete scheduledTasks[phone]; // ✅ Cleanup after execution
        });

        scheduledTasks[phone] = task;
    } catch (error) {
        console.error(`❌ Error scheduling message:`, error);
    }
}

// ✅ Function to Clear All Scheduled Tasks
function clearAllSchedules() {
    Object.values(scheduledTasks).forEach(task => task.stop());
    Object.keys(scheduledTasks).forEach(key => delete scheduledTasks[key]);
    console.log("🗑️ Cleared all scheduled tasks!");
}

module.exports = { scheduleMessage, clearAllSchedules };
