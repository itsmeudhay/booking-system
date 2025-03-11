const Booking = require('../models/booking');

// Check availability for a specific date
const checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const bookings = await Booking.find({ date });

    // List of predefined available time slots
    const availableSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    const bookedSlots = bookings.map(booking => booking.time_slot);

    const available = availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots: available });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error });
  }
};

module.exports = {
  checkAvailability
};
