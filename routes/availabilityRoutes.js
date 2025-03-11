const express = require('express');
const { checkAvailability } = require('../controllers/availabilityController');
const router = express.Router();

router.get('/', checkAvailability);

module.exports = router;
