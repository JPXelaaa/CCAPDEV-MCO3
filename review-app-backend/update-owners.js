/**
 * Script to update existing establishments with their owner information
 * Run this script once to migrate existing data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Establishment = require('./models/Establishment');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/review-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateEstablishmentOwners() {
  try {
    console.log('Starting establishment owner update...');
    
    // Get all users that are establishments
    const establishmentUsers = await User.find({ userType: 'establishment' });
    console.log(`Found ${establishmentUsers.length} establishment users`);
    
    // For each establishment user, find the corresponding establishment and update it
    let updateCount = 0;
    for (const user of establishmentUsers) {
      // Try to find an establishment with the same username as the user
      const establishment = await Establishment.findOne({ username: user.username });
      
      if (establishment) {
        // Update the establishment with the owner reference
        establishment.owner = user._id;
        await establishment.save();
        updateCount++;
        console.log(`Updated establishment ${establishment.name} with owner ${user.username}`);
      }
    }
    
    console.log(`Updated ${updateCount} establishments with owner information`);
    console.log('Establishment owner update completed');
  } catch (error) {
    console.error('Error updating establishment owners:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateEstablishmentOwners();
