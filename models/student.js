const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    course: String,
    courseFees: Number,
    paidFees: Number,
    reminderDate: { type: Date, default: null },
    reminderTime: String // Can be stored as a string (e.g., "14:30")
});

module.exports = mongoose.model('Student', StudentSchema);
