// Database configuration
const mongoose = require('mongoose');

// Connect to MongoDB database
const connectDB = async () => {
  try {
    // Configure MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 5000,   // Timeout after 5 seconds
      socketTimeoutMS: 45000,           // Close sockets after 45 seconds
      maxPoolSize: 50,                  // Maintain up to 50 socket connections
      family: 4                         // Use IPv4, skip trying IPv6
    };

    // Establish database connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);

    // Monitor database connection status
    mongoose.connection.on('connected', () => {
      console.log('[Database] MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[Database] MongoDB disconnected');
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('[Database] MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('[Database] Error during MongoDB disconnect:', err);
        process.exit(1);
      }
    });

    return connection;
  } catch (error) {
    console.error('[Database] MongoDB initial connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

// Define Add-on Schema
const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }, 
  price: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['food', 'decoration'], // Restrict to valid categories
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AddOn', addOnSchema);

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  date: { type: Date, required: true },
  time_slot: { type: String, required: true },
  duration: { type: Number, required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  add_ons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' }],
  special_requirements: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

// Define Customer Schema
const customerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: true },
  special_requirements: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);

// Define Package Schema
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);

// ---------------------------------------------//

// Add-on Controller Operations
const AddOn = require('../models/addOn');

// Retrieve all add-ons
const getAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOn.find();
    res.status(200).json(addOns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching add-ons', error });
  }
};

// Retrieve single add-on by ID
const getSingleAddOn = async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json(addOn);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching add-on', error });
  }
};

// Create new add-on
const postAllAddOns = async (req, res) => {
  try {
    const addOn = new AddOn(req.body);
    const savedAddOn = await addOn.save();
    res.status(201).json(savedAddOn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update existing add-on
const updateAddOn = async (req, res) => {
  try {
    const { name, price } = req.body;
    const updatedAddOn = await AddOn.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true }
    );
    if (!updatedAddOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json({
      message: 'Add-on updated successfully',
      addOn: updatedAddOn
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating add-on', error });
  }
};

// Delete add-on
const deleteAddOn = async (req, res) => {
  try {
    const deletedAddOn = await AddOn.findByIdAndDelete(req.params.id);
    if (!deletedAddOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json({ message: 'Add-on deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting add-on', error });
  }
};

module.exports = {
  getAllAddOns,
  getSingleAddOn,
  postAllAddOns,
  updateAddOn,
  deleteAddOn
};

// Availability Controller Operations
const Booking = require('../models/booking');

// Check time slot availability
const checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const bookings = await Booking.find({ date });

    // Define available time slots
    const availableSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    const bookedSlots = bookings.map(booking => booking.time_slot);

    // Filter out booked slots
    const available = availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots: available });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error });
  }
};

module.exports = {
  checkAvailability
};

// Booking Controller Operations
const Booking = require('../models/booking');
const Customer = require('../models/customer');
const Package = require('../models/package');
const AddOn = require('../models/addOn');
const { validateBookingData } = require('../validator/bookingValidator');
const mongoose = require('mongoose');

// Verify time slot availability
const checkAvailability = async (date, timeSlot, session) => {
  const existingBooking = await Booking.findOne({ date, time_slot: timeSlot }).session(session);
  return !existingBooking;
};

// Retrieve all bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'full_name email')
      .populate('package', 'name price')
      .populate('add_ons', 'name price');

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      date,
      timeSlot,
      duration,
      packageId,
      addOns = [],
      specialRequirements = ''
    } = req.body;

    // Validate booking request
    const validationErrors = await validateBookingData({
      customerId,
      packageId,
      date,
      timeSlot,
      duration
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Verify time slot availability
    const isAvailable = await checkAvailability(date, timeSlot, session);
    if (!isAvailable) {
      return res.status(409).json({ message: 'Time slot is not available.' });
    }

    // Retrieve package details
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(400).json({ message: 'Invalid package ID.' });
    }

    // Validate add-ons
    const validAddOns = await AddOn.find({ _id: { $in: addOns } });
    if (validAddOns.length !== addOns.length) {
      const invalidAddOns = addOns.filter(
        addOn => !validAddOns.some(
          validAddOn => validAddOn._id.toString() === addOn.toString()
        )
      );
      return res.status(400).json({
        message: `Invalid add-ons: ${invalidAddOns.join(', ')}`
      });
    }

    // Validate special requirements
    if (specialRequirements && specialRequirements.length > 500) {
      return res.status(400).json({
        message: 'Special requirements are too long.'
      });
    }

    // Calculate total booking cost
    const totalAddOnsPrice = validAddOns.reduce(
      (total, addOn) => total + addOn.price,
      0
    );
    const totalPrice = package.price + totalAddOnsPrice;

    // Create booking record
    const newBooking = new Booking({
      customer: customerId,
      date,
      time_slot: timeSlot,
      duration,
      package: packageId,
      add_ons: addOns,
      special_requirements: specialRequirements,
      status: 'pending',
      total_price: totalPrice,
    });

    // Save booking
    await newBooking.save({ session });

    // Populate booking details
    await newBooking.populate([
      { path: 'customer', select: 'full_name email' },
      { path: 'package', select: 'name price' },
      { path: 'add_ons', select: 'name price' },
    ]).execPopulate();

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...newBooking.toObject(),
      },
    });

  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    console.error('[Booking] Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createBooking, getBookings };

// Customer Controller Operations
const Customer = require('../models/customer');

// Validate customer information
const validateCustomerData = (data) => {
  const errors = [];
  const { full_name, email, phone_number } = data;

  if (!full_name || typeof full_name !== 'string') {
    errors.push('Full name is required.');
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Valid email is required.');
  }
  if (!phone_number || typeof phone_number !== 'string') {
    errors.push('Phone number is required.');
  }

  return errors;
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const { full_name, email, phone_number, special_requirements } = req.body;

    // Validate customer data
    const validationErrors = validateCustomerData({
      full_name,
      email,
      phone_number
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Check for existing customer
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({
        message: 'Customer with this email already exists.'
      });
    }

    // Create customer record
    const newCustomer = new Customer({
      full_name,
      email,
      phone_number,
      special_requirements
    });

    await newCustomer.save();
    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer
    });

  } catch (error) {
    console.error('[Customer] Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Retrieve customer details
const getCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ customer });
  } catch (error) {
    console.error('[Customer] Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update customer information
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { full_name, email, phone_number, special_requirements } = req.body;

    // Validate updated data
    const validationErrors = validateCustomerData({
      full_name,
      email,
      phone_number
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Update customer record
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        full_name,
        email,
        phone_number,
        special_requirements
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('[Customer] Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove customer
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('[Customer] Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
};

// Package Controller Operations
const Package = require('../models/package');

// Retrieve all packages
const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error });
  }
};

// Create new package
const postAllPackages = async (req, res) => {
  try {
    const package = new Package(req.body);
    const savedPackage = await package.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve single package
const getSinglePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(package);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package', error });
  }
};

// Update package details
const updatePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(package);
  } catch (error) {
    res.status(500).json({ message: 'Error updating package', error });
  }
};

// Remove package
const deletePackageById = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package', error });
  }
};

module.exports = {
  getAllPackages,
  postAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackageById
};

// ---------------------------------------------//

// Booking Validation
const Customer = require('../models/customer');
const Package = require('../models/package');

// Validate booking request data
const validateBookingData = async (data) => {
  const errors = [];
  const { customerId, packageId, date, timeSlot, duration } = data;

  // Verify customer exists
  const customerExists = await Customer.findById(customerId);
  if (!customerExists) errors.push('Customer not found.');

  // Verify package exists
  const packageExists = await Package.findById(packageId);
  if (!packageExists) errors.push('Package not found.');

  // Validate booking date
  if (new Date(date) < new Date()) {
    errors.push('Booking date cannot be in the past.');
  }

  // Validate time slot format
  const timeSlotRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeSlotRegex.test(timeSlot)) {
    errors.push('Invalid time slot format.');
  }

  // Validate duration
  if (duration <= 0 || !Number.isInteger(duration)) {
    errors.push('Duration must be a positive integer.');
  }

  return errors;
};

module.exports = {
  validateBookingData
};

// --------------------------------------------- //

// API Routes Configuration

// Add-on Routes
const express = require('express');
const {
  getAllAddOns,
  getSingleAddOn,
  postAllAddOns,
  updateAddOn,
  deleteAddOn
} = require('../controllers/addOnController');
const router = express.Router();

router.get('/', getAllAddOns);
router.get('/:id', getSingleAddOn);
router.post('/', postAllAddOns);
router.put('/:id', updateAddOn);
router.delete('/:id', deleteAddOn);

module.exports = router;

// Availability Routes
const express = require('express');
const { checkAvailability } = require('../controllers/availabilityController');
const router = express.Router();

router.get('/', checkAvailability);

module.exports = router;

// Booking Routes
const express = require('express');
const { createBooking, getBookings } = require('../controllers/bookingController');
const router = express.Router();

router.post('/', createBooking);
router.get('/', getBookings);

module.exports = router;

// Customer Routes
const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

router.post('/', createCustomer);
router.get('/:customerId', getCustomer);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

module.exports = router;

// Package Routes
const express = require("express");
const {
  getAllPackages,
  postAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackageById,
} = require("../controllers/packageController");
const router = express.Router();

router.get("/", getAllPackages);
router.post("/", postAllPackages);
router.get("/:id", getSinglePackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackageById);

module.exports = router;

// Server Configuration
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const connectDB = require('./config/database');
dotenv.config();

// Import route handlers
const bookingRoutes = require('./routes/bookingRoutes');
const packageRoutes = require('./routes/packageRoutes');
const addOnRoutes = require('./routes/addOnRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Initialize database connection
connectDB();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Monitor database connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('[Server] Connected to MongoDB');
});

// Register API routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/add-ons', addOnRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/customers', customerRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Booking API is operational');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
