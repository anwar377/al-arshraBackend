const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require("http");
const socketIO = require("socket.io");

const { connectDB } = require('./connectedDb/connectDb');
const { socketHandler, onlineUsers } = require('./socket/socketHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io with CORS configuration
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT"],
        credentials: true,
    },
});

// Initialize socket event handlers
socketHandler(io);

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://192.168.87.195:8081',
    'http://192.168.87.195:19000',
    'http://192.168.87.195:19006',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Attach io and onlineUsers to every request object for easy access in routes/controllers
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// Routes
// Quran Routes
app.use('/api/quran', require('./routes/quranRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/masjids', require('./routes/masjidRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));





// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
