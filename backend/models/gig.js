const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema( // (GeeksforGeeks, 2025).
    {
        title: {
            type: String,
            required: [true, "Gig title is required"],
            trim: true,
            // Programming Line (2020)
            minlength: [3, "Title must be at least 3 characters long"],
            maxlength: [100, "Title must not exceed 100 characters"]
        },
        description: {
            type: String,
            required: [true, "Gig description is required"],
            trim: true,
            maxlength: [1000, "Description must not exceed 1000 characters"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "A gig must be associated with a freelancer"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Gig", gigSchema);

/* Reference list:

   GeeksforGeeks, 2025. Mongoose Validation. [source code]. Available: <https://www.geeksforgeeks.org/mongodb/mongoose-validation/> [Accessed 9 October 2026].

   Programming Line, 2020. Mongoose Validation and Middleware. [source code]. Available: <https://learn.programmingline.com/learn/mongodb/mongodb-mongoose-validation> [Accessed 9 October 2026].

*/