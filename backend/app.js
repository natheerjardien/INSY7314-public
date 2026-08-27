require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();


// Middleware
app.use(cors());
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
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred"
    });
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`HustleHub+ API running on port ${PORT}`);
});