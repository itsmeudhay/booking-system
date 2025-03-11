// Validate booking data
const Customer = require('../models/customer');
const Package = require('../models/package');



const validateBookingData = async (data) => {
  const errors = [];
  const { customerId, packageId, date, timeSlot, duration } = data;

  const customerExists = await Customer.findById(customerId);
  if (!customerExists) errors.push('Customer not found.');

  const packageExists = await Package.findById(packageId);
  if (!packageExists) errors.push('Package not found.');

  if (new Date(date) < new Date()) errors.push('Booking date cannot be in the past.');

  const timeSlotRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeSlotRegex.test(timeSlot)) errors.push('Invalid time slot format.');

  if (duration <= 0 || !Number.isInteger(duration)) errors.push('Duration must be a positive integer.');

  return errors;
};

module.exports = {
    validateBookingData
  };