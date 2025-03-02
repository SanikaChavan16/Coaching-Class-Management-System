const express = require('express');
const router = express.Router();
const Student = require('../models/student'); // ✅ Fixed capitalization issue
const { sendMessage } = require('../whatsapp/whatsapp');
const { scheduleMessage } = require('../whatsapp/scheduler');

// 📌 Show Registration Form
router.get('/register', (req, res) => {
    res.render('register');
});

// 📌 View a Single Student
router.get('/view/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.render('viewStudent', { student });
    } catch (error) {
        console.error("❌ Error fetching student:", error);
        res.status(500).send('Error fetching student details');
    }
});

// 📌 Delete Student
router.post('/delete/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.redirect('/students/records');
    } catch (error) {
        console.error("❌ Error deleting student:", error);
        res.status(500).send('Error deleting student');
    }
});

// 📌 Show All Registered Students
router.get('/records', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('records', { students });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).send('Error fetching student records');
    }
});

// 📌 Handle Student Registration
router.post('/register', async (req, res) => {
    const { name, phone, email, course, courseFees, paidFees, reminderDate, reminderTime } = req.body;

    try {
        const newStudent = new Student({
            name,
            phone,
            email,
            course: course || "Not Provided",
            courseFees: courseFees || 0,
            paidFees: paidFees || 0,
            reminderDate: reminderDate || null,
            reminderTime: reminderTime || null
        });

        await newStudent.save();

        // ✅ Send Registration Success Message
        await sendMessage(phone, `✅ Registration Successful! Welcome, ${name}.`);

        // ✅ Send Paid Fees Confirmation if paid
        if (paidFees > 0) {
            await sendMessage(phone, `💰 Fees Paid: ₹${paidFees}`);
        }

        // ✅ Schedule Reminder if date & time are provided
        if (reminderDate && reminderTime) {
            scheduleMessage(phone, `📢 Reminder: Your remaining fees are pending!`, reminderDate, reminderTime);
        }

        res.redirect('/students/records');
    } catch (error) {
        console.error("❌ Error registering student:", error);
        res.status(500).send('Error registering student');
    }
});

// 📌 Fees Management Page
router.get('/fees-management', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('feesManagement', { students });
    } catch (error) {
        res.status(500).send('Error fetching student records');
    }
});

// 📌 Update Fees and Send WhatsApp Confirmation
router.post('/update-fees/:id', async (req, res) => {
    try {
        const { paidFees } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send('Student not found');

        // ✅ Update Fees in Database
        student.paidFees = paidFees;
        await student.save();

        // ✅ Send WhatsApp Confirmation After Fee Update
        const remainingFees = student.courseFees - paidFees;
        const message = `✅ Your fee payment of ₹${paidFees} has been recorded. Remaining fees: ₹${remainingFees}.`;
        await sendMessage(student.phone, message);

        res.json({ success: true, remainingFees });
    } catch (error) {
        console.error("❌ Error updating fees:", error);
        res.status(500).send('Error updating fees');
    }
});

// 📌 Schedule Reminder for Pending Fees (✅ Fixed Version)
router.post('/schedule-reminder', async (req, res) => {
    try {
        const { reminderDate, reminderTime } = req.body;

        console.log(`📅 Received Reminder Date: ${reminderDate}, Time: ${reminderTime}`);

        // ✅ Validate Date & Time
        const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
        if (isNaN(reminderDateTime.getTime())) {
            return res.json({ success: false, message: 'Invalid date/time format' });
        }

        // ✅ Fetch students with pending fees
        const students = await Student.find({ $expr: { $gt: ["$courseFees", "$paidFees"] } });

        if (students.length === 0) {
            return res.json({ success: false, message: 'No students with pending fees.' });
        }

        students.forEach(student => {
            console.log(`📢 Scheduling for: ${student.phone}, Name: ${student.name}`);
            scheduleMessage(student.phone, `📢 Reminder: Your fees are pending!`, reminderDate, reminderTime);
        });

        console.log("✅ All reminders scheduled successfully!");
        res.json({ success: true });

    } catch (error) {
        console.error("❌ Error scheduling reminders:", error);
        res.status(500).json({ success: false, message: 'Error scheduling reminders' });
    }
});

module.exports = router;
