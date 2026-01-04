const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../Models/User');

const migrateUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Update all users to have default role 'user' and isBanned false if missing
        console.log('Updating all users with default fields...');
        const updateResult = await User.updateMany(
            {
                $or: [
                    { role: { $exists: false } },
                    { isBanned: { $exists: false } }
                ]
            },
            {
                $set: {
                    role: 'user',
                    isBanned: false
                }
            }
        );
        console.log(`Updated ${updateResult.modifiedCount} users with default fields.`);

        // 2. Make specific user Admin
        const adminEmail = 'nirdeshbhesaniya@gmail.com';
        console.log(`Promoting ${adminEmail} to admin...`);

        const adminUpdate = await User.findOneAndUpdate(
            { email: adminEmail },
            { $set: { role: 'admin' } },
            { new: true }
        );

        if (adminUpdate) {
            console.log(`Successfully promoted ${adminEmail} to admin.`);
            console.log('User details:', {
                email: adminUpdate.email,
                role: adminUpdate.role,
                isBanned: adminUpdate.isBanned
            });
        } else {
            console.log(`User with email ${adminEmail} not found.`);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        console.log('Closing database connection...');
        await mongoose.connection.close();
        process.exit();
    }
};

migrateUsers();
