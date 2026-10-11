const express = require("express");
const router = express.Router();
const { validateAuth, validateRole } = require("../middleware/authMiddleware");
const { createGig, getGigs, getGigById, updateGig, deleteGig } = require("../controllers/gigController");

// Only freelancers can create and delete gigs
router.post("/", validateAuth, validateRole("Freelancer"), createGig);
router.delete("/:id", validateAuth, validateRole("Freelancer"), deleteGig);

router.get("/:id", validateAuth, getGigById);
router.put("/:id", validateAuth, validateRole("Freelancer"), updateGig);

// Clients and Freelancers can both view gigs
router.get("/", validateAuth, getGigs);

module.exports = router;