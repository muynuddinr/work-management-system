require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lovosis.in' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      existingAdmin.password = 'lovosis123'; // Plain password - let save() hash it
      await existingAdmin.save();
      console.log('✅ Password updated successfully!');
      
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create({
      name: 'Lovosis Admin',
      email: 'admin@lovosis.in',
      password: 'lovosis123', // Plain password - let the pre-save hook hash it
      role: 'admin',
      phone: '911234567890', // Your WhatsApp number
      joiningDate: new Date(),
      isActive: true,
      department: 'Management',
      position: 'System Administrator'
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Password: lovosis123');
    console.log('👔 Role:', admin.role);
    console.log('📱 Phone:', admin.phone);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 You can now login at:');
    console.log('   https://dashboard.lovosis.in/login');
    console.log('   or http://localhost:3000/login');
    console.log('\n   Email: admin@lovosis.in');
    console.log('   Password: lovosis123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
