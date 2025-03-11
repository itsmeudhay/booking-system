const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

// Create customer
router.post('/', createCustomer);

// Get customer by ID
router.get('/:customerId', getCustomer);

// Update customer by ID
router.put('/:customerId', updateCustomer);

// Delete customer by ID
router.delete('/:customerId', deleteCustomer);

module.exports = router;
