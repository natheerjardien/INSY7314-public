const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Gig = require("../models/gig");
const { sanitizeInput, isMalicious } = require("../utils/sanitizer");

// helper functions for local file storage (Node.js, 2026a).
const gigsFile = path.join(__dirname, "..", "data", "gigs.json");

const getLocalGigs = () => {
    // checks if the file exists, if not, it creates an empty array (Node.js, 2026a).
    if (!fs.existsSync(gigsFile)) {
        fs.writeFileSync(gigsFile, "[]");
    }
    const data = fs.readFileSync(gigsFile, "utf8");
    return JSON.parse(data);
};

const saveLocalGigs = (gigs) => {
    // formats the json with 2 spaces for readability
    fs.writeFileSync(gigsFile, JSON.stringify(gigs, null, 2));
};

const createGig = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        
        // Validate required fields and their data types.
        if (
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof category !== "string" ||
            price === undefined ||
            price === null ||
            title.trim() === "" ||
            description.trim() === "" ||
            category.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required and must be valid"
            });
        }

        // Validate field lengths before saving.
        if (
            title.trim().length < 3 ||
            title.trim().length > 100 ||
            description.trim().length > 1000 ||
            category.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Title must be 3–100 characters, description at most 1000 characters, and category at most 50 characters"
            });
        }

        // Reject suspicious input.
        if (
            isMalicious(title) ||
            isMalicious(description) ||
            isMalicious(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input detected"
            });
        }

        // Sanitize text and validate the price.
        const cleanTitle = sanitizeInput(title).trim();
        const cleanDescription = sanitizeInput(description).trim();
        const cleanCategory = sanitizeInput(category).trim();
        const gigPrice = Number(price);

        if (
            !Number.isFinite(gigPrice) ||
            gigPrice < 0 ||
            cleanTitle.length < 3 ||
            cleanTitle.length > 100 ||
            cleanDescription.length === 0 ||
            cleanDescription.length > 1000 ||
            cleanCategory.length === 0 ||
            cleanCategory.length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid gig details and a valid price"
            });
        }

        let gigResponse;

        // our mongodb logic
        if (process.env.STORAGE_MODE.toString() === "mongo") {
            // saves the new gig to db and links the freelancer (Mongoose, 2026).
            const gig = await Gig.create({
                title: cleanTitle,
                description: cleanDescription,
                price: gigPrice,
                category: cleanCategory,
                freelancer: req.user.id
            });
            gigResponse = gig;
        } 
        // our local file storage logic
        else {
            const gigs = getLocalGigs();
            
            // generates a random uuid for the local gig (Node.js, 2026b).
            const newGig = {
                id: crypto.randomUUID(),
                title: cleanTitle,
                description: cleanDescription,
                price: gigPrice,
                category: cleanCategory,
                freelancer: req.user.id || req.user._id,
                createdAt: new Date().toISOString()
            };
            
            // Appends the new gig to the existing array (Mozilla, 2026).
            gigs.push(newGig);
            saveLocalGigs(gigs);
            gigResponse = newGig;
        }

        return res.status(201).json({ success: true, gig: gigResponse });
    } catch (error) {
        console.error("Create gig error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getGigs = async (req, res) => {
    try {
        if (process.env.STORAGE_MODE.toString() === "mongo") {
            // retrieves all gigs and populates the freelancer details (Mongoose, 2026).
            const gigs = await Gig.find().populate("freelancer", "name email");
            return res.status(200).json({ success: true, gigs });
        } else {
            return res.status(200).json({ success: true, gigs: getLocalGigs() });
        }
    } catch (error) {
        console.error("Get gigs error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteGig = async (req, res) => {
    try {
        const gigId = req.params.id;

        if (
            process.env.STORAGE_MODE.toString() === "mongo" &&
            !/^[a-fA-F0-9]{24}$/.test(gigId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid gig ID"
            });
        }
        if (process.env.STORAGE_MODE.toString() === "mongo") {
            const gig = await Gig.findById(gigId);
            
            if (!gig) {
                return res.status(404).json({ success: false, message: "Gig not found" });
            }

            // Ensure the user deleting the gig is the one who created it
            if (gig.freelancer.toString() !== String(req.user._id || req.user.id)) {
                return res.status(403).json({ success: false, message: "Not authorized to delete this gig" });
            }

            // Removes the document from the collection (Mongoose, 2026).
            await gig.deleteOne();
        } else {
            let gigs = getLocalGigs();
            
            // Finds the exact index of the gig in the local array (Mozilla, 2026).
            const gigIndex = gigs.findIndex(g => g.id === gigId || g._id === gigId);
            
            if (gigIndex === -1) {
                return res.status(404).json({ success: false, message: "Gig not found" });
            }
            
            // Ensure the user deleting the gig is the one who created it
            if (gigs[gigIndex].freelancer !== (req.user.id || req.user._id)) {
                return res.status(403).json({ success: false, message: "Not authorized to delete this gig" });
            }

            // Removes the gig from the local array (Mozilla, 2026).
            gigs.splice(gigIndex, 1);
            saveLocalGigs(gigs);
        }

        return res.status(200).json({ success: true, message: "Gig deleted successfully" });
    } catch (error) {
        console.error("Delete gig error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getGigById = async (req, res) => {
    try {
        const gigId = req.params.id;

        if (process.env.STORAGE_MODE.toString() === "mongo") {
            const gig = await Gig.findById(gigId);
            if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
            return res.status(200).json(gig);
        } else {
            const gigs = getLocalGigs();
            const gig = gigs.find(g => g.id === gigId || g._id === gigId);
            if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });
            return res.status(200).json(gig);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const updateGig = async (req, res) => {
    try {
        const gigId = req.params.id;

        if (
            process.env.STORAGE_MODE.toString() === "mongo" &&
            !/^[a-fA-F0-9]{24}$/.test(gigId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid gig ID"
            });
        }
        const { title, description, price } = req.body;

        
        // Validate any fields included in the update.
        if (
            (title !== undefined && (
                typeof title !== "string" ||
                title.trim().length < 3 ||
                title.trim().length > 100 ||
                isMalicious(title)
            )) ||
            (description !== undefined && (
                typeof description !== "string" ||
                description.trim().length === 0 ||
                description.trim().length > 1000 ||
                isMalicious(description)
            )) ||
            (price !== undefined && (
                price === null ||
                price === "" ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            ))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid gig update details"
            });
        }

        const cleanTitle = title === undefined
            ? undefined
            : sanitizeInput(title).trim();

        const cleanDescription = description === undefined
            ? undefined
            : sanitizeInput(description).trim();

        if (
            (cleanTitle !== undefined &&
                (cleanTitle.length < 3 || cleanTitle.length > 100)) ||
            (cleanDescription !== undefined &&
                (cleanDescription.length === 0 || cleanDescription.length > 1000))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid title or description"
            });
        }

        if (process.env.STORAGE_MODE.toString() === "mongo") {
            const gig = await Gig.findById(gigId);
            if (!gig) return res.status(404).json({ success: false, message: "Gig not found" });

            // Ensure the user updating the gig is the owner
            if (gig.freelancer.toString() !== String(req.user._id || req.user.id)) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }

            // Updates the document fields and saves back to the database (Mongoose, 2026).
            if (cleanTitle !== undefined) gig.title = cleanTitle;
            if (cleanDescription !== undefined) gig.description = cleanDescription;
            if (price !== undefined) gig.price = Number(price);
            await gig.save();

            return res.status(200).json({ success: true, gig });
        } else {
            let gigs = getLocalGigs();
            const gigIndex = gigs.findIndex(g => g.id === gigId || g._id === gigId);
            
            if (gigIndex === -1) return res.status(404).json({ success: false, message: "Gig not found" });
            if (gigs[gigIndex].freelancer !== (req.user.id || req.user._id)) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }

            if (cleanTitle !== undefined) {
            gigs[gigIndex].title = cleanTitle;
        }

        if (cleanDescription !== undefined) {
            gigs[gigIndex].description = cleanDescription;
        }

        if (price !== undefined) {
            gigs[gigIndex].price = Number(price);
        }
            saveLocalGigs(gigs);

            return res.status(200).json({ success: true, gig: gigs[gigIndex] });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { createGig, getGigs, getGigById, updateGig, deleteGig };

/* Reference list:

   Mongoose, 2026. Documents. [source code]. Available: < https://mongoosejs.com/docs/documents.html > [Accessed 10 October 2026].

   Mongoose, 2026. Models. [source code]. Available: <https://mongoosejs.com/docs/models.html> [Accessed 09 October 2026].

   Mozilla, 2026. Array methods. [Online] MDN Web Docs. Available at: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array> [Accessed 09 October 2026].

   Node.js, 2026a. File System. [source code]. Available: <https://nodejs.org/api/fs.html> [Accessed 09 October 2026].

   Node.js, 2026b. Crypto. [source code]. Available: <https://nodejs.org/api/crypto.html> [Accessed 09 October 2026].

*/