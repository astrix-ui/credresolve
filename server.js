require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDatabase } = require('./config/dbConnector');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const serverPort = process.env.PORT || 3000;

// Import middleware
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files for simple frontend
app.use(express.static('public'));

// API routes
app.use('/api', apiRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'operational', 
    timestamp: new Date().toISOString() 
  });
});

// Initialize database connection and start server
const startApplication = async () => {
  try {
    await connectToDatabase();
    app.listen(serverPort, () => {
      console.log(`✓ Server running on port ${serverPort}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error.message);
    process.exit(1);
  }
};

startApplication();

module.exports = app;
