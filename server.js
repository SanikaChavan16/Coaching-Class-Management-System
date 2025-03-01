const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB().catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1); // Exit if DB connection fails
});

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Absolute path to public folder

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Session Configuration
app.use(session({
    name: 'sessionID', // Custom session name
    secret: process.env.JWT_SECRET || 'defaultsecret', // Use JWT_SECRET from .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production (HTTPS required)
        httpOnly: true, // Prevent client-side JS access
        sameSite: 'strict', // Protect against CSRF
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/students', require('./routes/students'));

// Redirect root URL to login page
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// Logout Route
app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("❌ Logout Error:", err);
            return res.status(500).send("Error logging out");
        }
        res.clearCookie('sessionID'); // Clear session cookie
        res.redirect('/auth/login');
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
