require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");

const app = express();


// Middleware
// we enabled cors so our frontend can securely communicate with this api
app.use(cors());
// parses incoming json payloads so we can read req.body (Express.js, 2024).
app.use(express.json());


// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HustleHub+ API is running"
    });
});


// Authentication routes
app.use("/api/auth", authRoutes);


// 404 handler
// catches any requests to endpoints that don't exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// Global error handler
// centralizes error handling to prevent sensitive stack traces from leaking to the client (Express.js, 2024).
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred"
    });
});

// starts the server and database connection
const PORT = process.env.PORT || 5000;

// we use a toggle switch in our .env file to easily swap between cloud and local storage modes (Node.js, 2024).
if (process.env.STORAGE_MODE.toString() === "mongo") {
    // tries connecting to mongodb atlas (Mongoose, 2024).
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("mongodb connected successfully");
            app.listen(PORT, () => {
                console.log(`hustlehub+ api running on port ${PORT} (mongo mode)`);
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
    app.listen(PORT, () => {
        console.log(`hustlehub+ api running on port ${PORT} (local mode)`);
    });
}

/* Reference list:

   Express.js, 2024. Error Handling. [source code]. Available: <https://expressjs.com/en/guide/error-handling.html> [Accessed 27 August 2026].

   Mongoose, 2024. Connections. [source code]. Available: <https://mongoosejs.com/docs/connections.html> [Accessed 27 August 2026].
   
   Node.js, 2024. process.env. [source code]. Available: <https://nodejs.org/api/process.html#process_process_env> [Accessed 27 August 2026].

*/