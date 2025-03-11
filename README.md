# Booking System Backend

A Node.js backend service for managing bookings, customers, packages, and add-ons.

## Features

- Booking management system
- Time slot availability checking
- Customer management
- Package and add-on handling
- Validation for booking requests
- Price calculation including add-ons

## Prerequisites

- Node.js (version X.X.X)
- MongoDB (version X.X.X)
- npm or yarn

## Installation

1. Clone the repository
    ```bash
    git clone [repository-url]
    ```

2. Install dependencies
    ```bash
    npm install
    ```

3. Configure environment variables

   Create a `.env` file in the root directory with the following variables:

    ```
    MONGODB_URI=your_mongodb_connection_string
    PORT=3000
    ```

## Project Structure

booking-system-backend/ ├── controllers/ │ └── bookingController.js ├── models/ │ ├── booking.js │ ├── customer.js │ ├── package.js │ └── addOn.js ├── validator/ │ └── bookingValidator.js

## API Endpoints

### Bookings

#### Get All Bookings
**GET /bookings**

Returns a list of all bookings with customer, package, and add-on details.

#### Create Booking
**POST /bookings**

Creates a new booking.

**Request body:**
```json
{
  "customerId": "string",
  "date": "YYYY-MM-DD",
  "timeSlot": "string",
  "duration": "number",
  "packageId": "string",
  "addOns": ["string"],
  "specialRequirements": "string"
}

### Validation
The system validates:

Customer existence
Package validity
Add-on validity
Time slot availability
Special requirements length (max 500 characters)
Error Handling
The API returns appropriate HTTP status codes:

200: Success
201: Resource created
400: Bad request
409: Conflict (time slot unavailable)
500: Server error
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/your-feature)
Commit your changes (git commit -am 'Add new feature')
Push to the branch (git push origin feature/your-feature)
Create a new Pull Request
License
Add your license information here

---

### Notes for Customization:

1. Replace `[repository-url]` with the actual repository URL where your code is hosted.
2. Specify the exact versions of Node.js and MongoDB that your project requires.
3. Expand on the API documentation if necessary to include more details about each endpoint.
4. Update the license section with appropriate information, such as the type of license (MIT, Apache 2.0, etc.).
5. Update or add any other environment variables that might be required for your specific setup.

This README should serve as a comprehensive guide for setting up, using, and contributing to your Node.js backend booking system.
