const express = require('express');
const router = express.Router();

// Dummy admin credentials
const ADMIN = { username: 'admin', password: 'pass@123' };

// Admin Login Page
router.get('/login', (req, res) => {
    res.render('index'); // Renders login page
});

// Handle Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN.username && password === ADMIN.password) {
        req.session.admin = username;
        res.redirect('/dashboard');
    } else {
        res.send('Invalid Credentials');
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
