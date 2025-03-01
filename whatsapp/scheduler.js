const cron = require('node-cron');
const { sendMessage } = require('./whatsapp');

const scheduledTasks = {}; // Store scheduled jobs

// Function to Schedule Messages
function scheduleMessage(phone, message, date, time) {
    try {
        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');

        // Validate date and time
        if (!year || !month || !day || !hour || !minute) {
            console.error(`❌ Invalid date/time for scheduling: ${date} ${time}`);
            return;
        }

        // Convert to integers
        const jobDate = new Date(`${date}T${time}:00`);
        if (isNaN(jobDate.getTime())) {
            console.error(`❌ Invalid date/time format: ${date} ${time}`);
            return;
        }

        // Convert to correct cron format: "second minute hour day month *"
        const cronTime = `0 ${minute} ${hour} ${day} ${month} *`;

        // Stop any previous task for this phone number
        if (scheduledTasks[phone]) {
            scheduledTasks[phone].stop();
            console.log(`🔄 Overwriting previous reminder for ${phone}`);
        }

        console.log(`📅 Scheduling reminder for ${phone} at ${cronTime}`);

        // Schedule the message
        const task = cron.schedule(cronTime, async () => {
            console.log(`📢 Sending reminder to ${phone}`);
            await sendMessage(phone, message);
            task.stop(); // Stop the task after execution
            delete scheduledTasks[phone]; // Remove the task reference
        });

        scheduledTasks[phone] = task;
    } catch (error) {
        console.error(`❌ Error scheduling message:`, error);
    }
}

module.exports = { scheduleMessage };
