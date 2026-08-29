const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const User = require("../models/user");
const generateToken = require("../utils/generateToken");

// helper functions for local file storage (Node.js, 2024).
const usersFile = path.join(__dirname, "..", "data", "users.json");

const getUsers = () => {
    // checks if file exists, if not, it creates an empty array
    if (!fs.existsSync(usersFile)) 
    {
        fs.writeFileSync(usersFile, "[]");
    }
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
};

const saveUsers = (users) => {
    // formats the json nicely with 2 spaces for readability
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const registerUser = async (req, res) => {
    try 
    {
        const { name, email, password, role } = req.body;

        // Validates all the required fields
        if (!name || !email || !password) 
        {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // hash password (applies to both storage modes) (Bcrypt, 2024).
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const assignedRole = role || "Client";

        let userResponse;

        // our mongodb logic (if storage mode is set to mongo in .env file)
        if (process.env.STORAGE_MODE.toString() === "mongo") 
        {
            // check if email is already taken (Mongoose, 2024).
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            
            if (existingUser) 
            {
                return res.status(409).json({ success: false, message: "user already exists" });
            }

            // saves the new user to db
            const user = await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: assignedRole
            });

            // strips out the password before sending back the response
            userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };
        
        // -our local file storage logic (if storage mode is set to local in .env file)
        } 
        else 
        {
            const users = getUsers();
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser) 
            {
                return res.status(409).json({ success: false, message: "user already exists" });
            }

            // generates a random uuid for the local user (Node.js, 2024).
            const newUser = {
                id: crypto.randomUUID(),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: assignedRole
            };

            users.push(newUser);
            saveUsers(users);

            userResponse = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        }

        // returns generic success response for both modes
        return res.status(201).json({
            success: true,
            message: "user registered successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while registering the user"
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validates all the required fields
        if (!email || !password)
        {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        let user;

        // mongodb logic
        if (process.env.STORAGE_MODE.toString() === "mongo") 
        {
            user = await User.findOne({ email: email.toLowerCase().trim() });
        }
        // local file storage logic
        else 
        {
            const users = getUsers();
            user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
            // maps the 'id' to '_id' so the token generator works consistently for both modes
            if (user)
            {
                user._id = user.id; 
            }
        }

        // generic check and compare logic for both modes
        // we keep the message vague ("invalid credentials") so attackers dont know if the email exists
        if (!user) 
        {
            return res.status(401).json({ success: false, message: "invalid credentials" });
        }

        // compare plain text password with hashed password (Bcrypt, 2024).
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) 
        {
            return res.status(401).json({ success: false, message: "invalid credentials" });
        }

        // generate the jwt if everything matches
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "login successful",
            token,
            user: {
                id: user._id || user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while logging in"
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};

/* Reference list:

   Bcrypt, 2024. bcrypt.js. [source code]. Available: <https://www.npmjs.com/package/bcryptjs> [Accessed 27 August 2026].
   
   Mongoose, 2024. Queries. [source code]. Available: <https://mongoosejs.com/docs/queries.html> [Accessed 25 August 2026].
   
   Node.js, 2024. File System. [source code]. Available: <https://nodejs.org/api/fs.html> [Accessed 25 August 2026].

*/