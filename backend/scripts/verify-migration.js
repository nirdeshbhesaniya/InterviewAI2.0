const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../Models/User');

const verifyMigration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'nirdeshbhesaniya@gmail.com' });
        if (user) {
            console.log('Verification Result:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('IsBanned:', user.isBanned);
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

verifyMigration();
