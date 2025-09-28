const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http'); // إضافة هذا السطر
const socketIo = require('socket.io'); // إضافة هذا السطر
require('dotenv').config();

const productRoutes = require('./routes/productsRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// إنشاء خادم HTTP من تطبيق Express
const server = http.createServer(app);

// إعداد Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // يمكنك تغيير هذا للمزيد من الأمان
    methods: ["GET", "POST"]
  }
});

// جعل io متاحاً في كل مكان في التطبيق
app.set('io', io);

// Middleware Setup
app.use(morgan('dev'));

app.use((req, res, next) => {
    console.log(`📅 Request received at: ${new Date().toISOString()}`);
    console.log(`🌐 Request method: ${req.method}`);
    console.log(`🔗 Request URL: ${req.url}`);
    next();
});

app.use(express.json());
// Serve static files from public directory
app.use(express.static('public'));
// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🎯 Host: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// إعداد Socket.io event handlers
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);

    // حدث للانضمام إلى غرفة دردشة
    socket.on('joinChat', (userData) => {
        socket.join('chatRoom');
        console.log(`👤 User ${userData.username || 'Anonymous'} joined chat room`);
        
        // إرسال رسالة ترحيب للعميل الجديد فقط
        socket.emit('chatMessage', {
            type: 'system',
            username: 'System',
            message: 'Welcome to the chat room!',
            timestamp: new Date().toISOString()
        });

        // إعلام الجميع بأن مستخدم جديد انضم
        socket.to('chatRoom').emit('chatMessage', {
            type: 'system',
            username: 'System',
            message: `A new user has joined the chat`,
            timestamp: new Date().toISOString()
        });
    });

    // حدث لاستقبال رسائل الدردشة
    socket.on('chatMessage', (data) => {
        console.log(`💬 Chat message from ${data.username}: ${data.message}`);
        
        // بث الرسالة لجميع العملاء في غرفة الدردشة
        io.to('chatRoom').emit('chatMessage', {
            type: 'user',
            username: data.username,
            message: data.message,
            timestamp: new Date().toISOString(),
            userId: data.userId
        });
    });

    // حدث لطلب عدد المستخدمين المتصلين
    socket.on('getOnlineUsers', () => {
        socket.emit('onlineUsersCount', {
            count: io.engine.clientsCount
        });
    });

    // حدث عند فصل المستخدم
    socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
        console.log(`👥 Remaining clients: ${io.engine.clientsCount - 1}`);
        
        // إعلام الآخرين بأن مستخدم غادر (اختياري)
        socket.to('chatRoom').emit('chatMessage', {
            type: 'system',
            username: 'System',
            message: 'A user has left the chat',
            timestamp: new Date().toISOString()
        });
    });

    // حدث للرسائل الخاصة (مثال متقدم)
    socket.on('privateMessage', (data) => {
        // يمكن تطوير هذا لاحقاً لإرسال رسائل خاصة
        console.log(`📨 Private message from ${data.from} to ${data.to}`);
    });
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Start server only after database connection
const startServer = async () => {
    try {
        await connectDB();
        
        // تغيير app.listen إلى server.listen
        server.listen(PORT, () => {
            console.log('\n🚀 Server Information:');
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API Base URL: http://localhost:${PORT}/api/products`);
            console.log(`🔌 Socket.io is running on: http://localhost:${PORT}`);
            console.log('=' .repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

// Start the application
startServer();

module.exports = app;