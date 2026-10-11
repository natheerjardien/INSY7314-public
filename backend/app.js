require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const https = require("https"); 
const fs = require("fs"); 
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();


// Middleware
app.disable("x-powered-by");

// Adds security-related HTTP headers.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:"]
            }
        }
    })
);

// Allows requests from the frontend.
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Limits the size of incoming JSON requests.
app.use(express.json({ limit: "100kb" }));

// Limits repeated login and registration requests.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});


// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HustleHub+ API is running"
    });
});


// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bookings", bookingRoutes);


// 404 handler
// catches any requests to endpoints that don't exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// Global error handler
// centralizes error handling to prevent sensitive stack traces from leaking to the client (Express.js, 2024a).
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred"
    });
});

// reads the local ssl certificates we generated in the certs folder (Node.js, 2024a)
// path.join ensures the file paths work correctly across different operating systems
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "certs", "localhost.key")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "localhost.crt"))
};

// starts the server and database connection
const PORT = process.env.PORT || 5000;

// we use a toggle switch in our .env file to easily swap between cloud and local storage modes (Node.js, 2024b).
if (process.env.STORAGE_MODE.toString() === "mongo") {
    // tries connecting to mongodb atlas (Mongoose, 2024).
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("mongodb connected successfully");

            // wraps our express app in the native https server to encrypt traffic (Express.js, 2024b)
            https.createServer(sslOptions, app).listen(PORT, () => {
                console.log(`hustlehub+ api running on https://localhost:${PORT} (mongo mode)`);
            });
        })
        .catch((error) => {
            console.error("mongodb connection failed:", error.message);
            console.log("tip: change STORAGE_MODE to 'local' in your .env to bypass this.");
            process.exit(1); // stops the server if db fails so we know theres an issue
        });
} else {
    // fallback to local mode, ignoring mongoose entirely
    console.log("running in local storage mode. bypassing mongodb.");

    // wraps our express app in the native https server for local mode too (Express.js, 2024b)
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`hustlehub+ api running on https://localhost:${PORT} (local mode)`);
    });
}

/* Reference list:

   Express.js, 2024a. Error Handling. [source code]. Available: <https://expressjs.com/en/guide/error-handling.html> [Accessed 27 August 2026].

   Express.js, 2024b. Security Best Practices. [source code]. Available: <https://expressjs.com/en/advanced/best-practice-security.html> [Accessed 2 September 2026].

   Mongoose, 2024. Connections. [source code]. Available: <https://mongoosejs.com/docs/connections.html> [Accessed 27 August 2026].

   Node.js, 2024a. HTTPS. [source code]. Available: <https://nodejs.org/api/https.html> [Accessed 2 September 2026].
   
   Node.js, 2024b. process.env. [source code]. Available: <https://nodejs.org/api/process.html#process_process_env> [Accessed 27 August 2026].

*/