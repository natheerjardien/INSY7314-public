const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Booking = require("../models/booking");
const Gig = require("../models/gig");

// helper functions for local file storage (Node.js, 2026a).
const bookingsFile = path.join(__dirname, "..", "data", "bookings.json");
const gigsFile = path.join(__dirname, "..", "data", "gigs.json"); 
const usersFile = path.join(__dirname, "..", "data", "users.json");

// retrieve any local bookings
const getLocalBookings = () => {
    if (!fs.existsSync(bookingsFile)) {
        fs.writeFileSync(bookingsFile, "[]");
    }
    const data = fs.readFileSync(bookingsFile, "utf8");
    return JSON.parse(data);
};

// save local bookings
const saveLocalBookings = (bookings) => {
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
};

// create a booking
const createBooking = async (req, res) => {
    try {
        const { gigId } = req.body;

        if (typeof gigId !== "string" || !gigId.trim()) {
    return res.status(400).json({
        success: false,
        message: "A valid Gig ID is required"
    });
}

        // MongoDB IDs must be 24 hexadecimal characters.
        if (
            process.env.STORAGE_MODE === "mongo" &&
            !/^[a-fA-F0-9]{24}$/.test(gigId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Gig ID"
            });
        }

        let newBooking;

        // mongodb logic
        if (process.env.STORAGE_MODE.toString() === "mongo") {
            const gig = await Gig.findById(gigId);
            
            if (!gig) {
                return res.status(404).json({ success: false, message: "Gig not found" });
            }

            // Validates that the client cannot book their own gig
            if (
            gig.freelancer.toString() ===
            String(req.user._id || req.user.id)
        ) {
                return res.status(403).json({ success: false, message: "You cannot book your own gig" });
            }

            // Creates the simulated transaction record (Mongoose, 2026a).
            newBooking = await Booking.create({
                gig: gig._id,
                client: req.user.id,
                freelancer: gig.freelancer,
                amount: gig.price,
                paymentReference: `SIM-${crypto.randomUUID().split("-")[0].toUpperCase()}`
            });

        } 
        // local file storage logic
        else {
            const gigs = fs.existsSync(gigsFile)
    ? JSON.parse(fs.readFileSync(gigsFile, "utf8"))
    : [];
            const gig = gigs.find(g => g.id === gigId || g._id === gigId);
            
            if (!gig) {
                return res.status(404).json({ success: false, message: "Gig not found" });
            }
            
            if (gig.freelancer === (req.user.id || req.user._id)) {
                return res.status(403).json({ success: false, message: "You cannot book your own gig" });
            }

            const bookings = getLocalBookings();
            
            // generates a random uuid for the transaction (Node.js, 2026b).
            newBooking = {
                id: crypto.randomUUID(),
                gig: gig.id || gig._id,
                client: req.user.id || req.user._id,
                freelancer: gig.freelancer,
                amount: gig.price,
                status: "Confirmed",
                paymentReference: `SIM-${crypto.randomUUID().split("-")[0].toUpperCase()}`,
                createdAt: new Date().toISOString()
            };
            
            bookings.push(newBooking);
            saveLocalBookings(bookings);
        }

        return res.status(201).json({ 
            success: true, 
            message: "Booking confirmed successfully", 
            booking: newBooking 
        });

    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Retrieve the freelancer income
const getFreelancerIncome = async (req, res) => {
    try {
        const freelancerId = req.user.id || req.user._id;
        let myBookings;
        let totalIncome = 0;

        if (process.env.STORAGE_MODE.toString() === "mongo") {
            // Finds all bookings tied to the freelancer and populates gig reference (Mongoose, 2026b).
            myBookings = await Booking.find({ freelancer: freelancerId })
                .populate("gig", "title category")
                .populate("client", "name email");
            
            // Calculates total sum of amounts using array reduce (Mozilla, 2026).
            totalIncome = myBookings.reduce(
            (sum, booking) =>
                booking.status === "Cancelled"
                    ? sum
                    : sum + Number(booking.amount || 0),
            0
        );
    
        } else {
            const allBookings = getLocalBookings();

            const gigs = fs.existsSync(gigsFile)
                ? JSON.parse(fs.readFileSync(gigsFile, "utf8"))
                : [];

            const users = fs.existsSync(usersFile)
                ? JSON.parse(fs.readFileSync(usersFile, "utf8"))
                : [];

            myBookings = allBookings
                .filter(booking => booking.freelancer === freelancerId)
                .map(booking => {
                    const gigRef = gigs.find(
                        g => (g.id || g._id) === booking.gig
                    );

                    const clientRef = users.find(
                        u => (u.id || u._id) === booking.client
                    );

                    return {
                        ...booking,
                        gig: gigRef
                            ? { title: gigRef.title, category: gigRef.category }
                            : null,
                        client: clientRef
                            ? { name: clientRef.name, email: clientRef.email }
                            : null
                    };
                });

            totalIncome = myBookings.reduce(
                (sum, booking) =>
                    booking.status === "Cancelled"
                        ? sum
                        : sum + Number(booking.amount || 0),
                0
            );
        }

        return res.status(200).json({ 
            success: true, 
            totalIncome,
            bookings: myBookings 
        });

    } catch (error) {
        console.error("Get income error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { createBooking, getFreelancerIncome };

/* Reference list:

   Mongoose, 2026a. Models. [source code]. Available: <https://mongoosejs.com/docs/models.html> [Accessed 09 October 2026].
   
   Mongoose, 2026b. Populate. [source code]. Available: <https://mongoosejs.com/docs/populate.html> [Accessed 09 October 2026].

   Mozilla, 2026. Array methods. [Online] MDN Web Docs. Available at: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array> [Accessed 09 October 2026].

   Node.js, 2026a. File System. [source code]. Available: <https://nodejs.org/api/fs.html> [Accessed 09 October 2026].

   Node.js, 2026b. Crypto. [source code]. Available: <https://nodejs.org/api/crypto.html> [Accessed 09 October 2026].

*/