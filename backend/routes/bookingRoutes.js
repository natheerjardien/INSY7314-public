const express = require("express");
const router = express.Router();
const { validateAuth, validateRole } = require("../middleware/authMiddleware");
const { createBooking, getFreelancerIncome } = require("../controllers/bookingController");

const rateLimit = require("express-rate-limit");

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many booking attempts. Please try again later."
    }
});

// Only clients can initiate bookings
router.post("/", bookingLimiter, validateAuth, validateRole("Client"), createBooking);

// Only freelancers can view their earnings/transactions
router.get("/income", validateAuth, validateRole("Freelancer"), getFreelancerIncome);

module.exports = router;