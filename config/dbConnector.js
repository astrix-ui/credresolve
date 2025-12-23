const mongoose = require('mongoose');

let connectionEstablished = false;

/**
 * Establishes connection to MongoDB database
 * Uses retry logic for production resilience
 */
const connectToDatabase = async () => {
  if (connectionEstablished) {
    console.log('Database already connected');
    return;
  }

  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ledger_hub_db';
  
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    connectionEstablished = true;
    console.log('✓ Database connection established');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('Database error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Database disconnected');
      connectionEstablished = false;
    });
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

const closeDatabaseConnection = async () => {
  if (connectionEstablished) {
    await mongoose.connection.close();
    connectionEstablished = false;
    console.log('Database connection closed');
  }
};

module.exports = {
  connectToDatabase,
  closeDatabaseConnection
};
