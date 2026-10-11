const jwt = require("jsonwebtoken");

// Generates a signed JWT containing the user's ID and role
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        // Secret key used to sign and verify the JWT
        process.env.JWT_SECRET,
        {
            // Limits the token's validity to one hour
            expiresIn: "1h"
        }
    );
};

module.exports = generateToken;