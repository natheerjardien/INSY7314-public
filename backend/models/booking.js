const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema( // (GeeksforGeeks, 2025).
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: [true, "A booking must reference a gig"]
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "A booking must have a client"]
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "A booking must be associated with a freelancer"]
        },
        amount: {
    type: Number,
    required: [true, "Transaction amount is required"],
    min: [0, "Transaction amount cannot be negative"]
},
        status: {
            type: String,
            enum: ["Confirmed", "Completed", "Cancelled"],
            default: "Confirmed"
        },
        paymentReference: {
    type: String,
    required: true,
    unique: true,
    default: () => `SIM-${require("crypto").randomUUID()}`
}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);

/* Reference list:

   GeeksforGeeks, 2025. Mongoose Validation. [source code]. Available: <https://www.geeksforgeeks.org/mongodb/mongoose-validation/> [Accessed 9 October 2026].
   
*/