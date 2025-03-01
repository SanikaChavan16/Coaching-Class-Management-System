const cron = require('node-cron');
const { sendMessage } = require('./whatsapp');

const scheduledTasks = {}; // Store scheduled jobs

// Function to Schedule Messages
function scheduleMessage(phone, message, date, time) {
    const [hour, minute] = time.split(':');
    const [year, month, day] = date.split('-');

    const cronTime = `${minute} ${hour} ${day} ${month} *`; // Correct cron format

    //console.log(`📅 Scheduling message for ${phone} at ${date} ${time} -> CRON: ${cronTime}`);

    if (scheduledTasks[phone]) {
        scheduledTasks[phone].stop(); // Stop previous task if exists
        console.log(`🔄 Overwriting previous task for ${phone}`);
    }

    const task = cron.schedule(cronTime, async () => {
        //console.log(`⏳ Sending reminder to ${phone}: ${message}`);
        await sendMessage(phone, message);
        //console.log(`✅ Reminder sent to ${phone}`);

        task.stop(); // Stop task after execution
        delete scheduledTasks[phone]; // Remove task reference
    });

    scheduledTasks[phone] = task;
}

module.exports = { scheduleMessage };
