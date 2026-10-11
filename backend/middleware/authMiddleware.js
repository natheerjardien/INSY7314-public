const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

// validate the user authentication token
const validateAuth = async (req, res, next) => // (rudderz243, 2026)
{

    let token;

    // check for the token
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
) { 
        try {

        token = req.headers.authorization.split(" ")[1];
        if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({
        message: "Server authentication is not configured."
    });
}

const decode = jwt.verify(token, process.env.JWT_SECRET);

        // try and find the user associated with that token
        req.user = await User.findById(decode.id).select("-password");

        // check whether a user was found using that token
        if (!req.user) 
        {
            return res
                .status(401)
                .json({ message: "Requesting user no longer exists" });
        }

        return next();

        } 
        catch (error) 
        {
        // if token failed to authenticate, deny all access
        return res
            .status(401)
            .json({ message: "Not authorized, failed to validate token." });
        }
    }

    // if no token is provided, the user is not authorized
    if (!token) 
    {
        return res
        .status(401)
        .json({ message: "Not authorized, no token provided." });
    }
};

// validating that the token has the appropriate permissions/authorization to do the request
const validateRole = (...roles) => // (rudderz243, 2026)
{

    return (req, res, next) => 
    {

        if (!req.user || !roles.includes(req.user.role)) 
        {
            return res
                .status(403)
                .json({ message: "Denied: You do not have permission to do this." });
        }

    // once the role is validated, pass the incoming request
    next();

    };
};

module.exports = { validateAuth, validateRole };

/* Reference List:

    rudderz243, 2026. insy7314-library (Version 1.0) [source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 27 August 2026].

*/