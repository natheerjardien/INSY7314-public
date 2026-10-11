const mongoose = require("mongoose");

// Defines the structure and validation rules for user documents (GeeksforGeeks, 2025).
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            // Programming Line (2020) demonstrates how to use minlength, maxlength, enum and unique
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name must not exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"]
        },

        role: {
            type: String,
            enum: ["Client", "Freelancer", "Admin"],
            default: "Client"
        }
    },
    {
        // Automatically records when the user was created and updated.
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);

/* Reference list:

   GeeksforGeeks, 2025. Mongoose Validation. [source code]. Available: <https://www.geeksforgeeks.org/mongodb/mongoose-validation/> [Accessed 27 August 2026].

   Programming Line, 2020. Mongoose Validation and Middleware. [source code]. Available: <https://learn.programmingline.com/learn/mongodb/mongodb-mongoose-validation> [Accessed 27 August 2026].

*/