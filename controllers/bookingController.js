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
    const isAvailable = await checkAvailability(date, timeSlot);
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

    // Save booking (no session, just a direct save)
    await newBooking.save();

    // Populate booking details (must await the populate method)
    await newBooking.populate([
      { path: 'customer', select: 'full_name email' },
      { path: 'package', select: 'name price' },
      { path: 'add_ons', select: 'name price' },
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking.toObject(), // no need to spread, toObject handles it
    });

  } catch (error) {
    console.error('[Booking] Error creating booking:', error);
    console.error(error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { createBooking, getBookings };
