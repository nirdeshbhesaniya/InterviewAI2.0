const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Interview = require('../models/Interview');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const listSessions = async () => {
    await connectDB();
    try {
        const sessions = await Interview.find({}, 'title createdAt');
        console.log('SESSION_LIST_START');
        sessions.forEach(s => {
            console.log(JSON.stringify({ title: s.title, createdAt: s.createdAt, id: s._id }));
        });
        console.log('SESSION_LIST_END');
    } catch (error) {
        console.error('Error listing sessions:', error);
    }
    mongoose.connection.close();
};

listSessions();
