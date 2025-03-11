const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const connectDB = require('./config/database');
dotenv.config();

const bookingRoutes = require('./routes/bookingRoutes');
const packageRoutes = require('./routes/packageRoutes');
const addOnRoutes = require('./routes/addOnRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Database Connection
connectDB();

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/add-ons', addOnRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
    res.send('Booking API is running!');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
