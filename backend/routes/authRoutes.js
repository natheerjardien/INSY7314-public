// express
const express = require("express");

//password hashing
const bcrypt = require("bcryptjs");

//node.js modules
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const jwt = require("jsonwebtoken");

const router = express.Router();

// data stored locally using file based storage
const usersFile = path.join(__dirname, "..", "data", "users.json");

function getUsers() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, "[]");
    }

    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );
}


// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const users = getUsers();

        const existingUser = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: crypto.randomUUID(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role
        };

        users.push(newUser);

        saveUsers(users);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const users = getUsers();

        const user = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        //generate jwt when user successfully logs in (authentication)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});


module.exports = router;