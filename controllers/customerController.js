const Customer = require('../models/customer');

// Validate customer data
const validateCustomerData = (data) => {
  const errors = [];

  const { full_name, email, phone_number } = data;

  // Check that the customer has full_name, email, and phone_number
  if (!full_name || typeof full_name !== 'string') errors.push('Full name is required.');
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('Valid email is required.');
  if (!phone_number || typeof phone_number !== 'string') errors.push('Phone number is required.');

  return errors;
};

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { full_name, email, phone_number, special_requirements } = req.body;

    // Validate customer data
    const validationErrors = validateCustomerData({ full_name, email, phone_number });
    if (validationErrors.length > 0) return res.status(400).json({ errors: validationErrors });

    // Check if email already exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) return res.status(400).json({ message: 'Customer with this email already exists.' });

    // Create new customer
    const newCustomer = new Customer({
      full_name,
      email,
      phone_number,
      special_requirements
    });

    await newCustomer.save();
    res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get customer details
const getCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Find customer by ID
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    res.status(200).json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update customer details
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { full_name, email, phone_number, special_requirements } = req.body;

    // Validate customer data
    const validationErrors = validateCustomerData({ full_name, email, phone_number });
    if (validationErrors.length > 0) return res.status(400).json({ errors: validationErrors });

    // Update customer details
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { full_name, email, phone_number, special_requirements },
      { new: true } // Return the updated document
    );

    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found.' });

    res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Delete customer by ID
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found.' });

    res.status(200).json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
};
