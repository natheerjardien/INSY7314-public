// moved all logic out from authRoutes.js to authController.js for better separation to keep our architecture modular and clean (Express.js, 2024).

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// routes the traffic to the controller functions (Express.js, 2024).
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;

/* Reference list:

   Express.js, 2024. Routing. [source code]. Available: <https://expressjs.com/en/guide/routing.html> [Accessed 27 August 2026].

*/