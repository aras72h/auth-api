// Implement basic user CRUD and authentication
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const app = express();
app.use(bodyParser.json());


const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};


// Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Handle existing users
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashedPassword]
        );

        // Generate and send back JWT token
        const token = generateToken(newUser.rows[0]);
        res.status(201).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Login a user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user email
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate and send JWT token
        const token = generateToken(user.rows[0]);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Middleware for authentication
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};


// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});


// Update user
app.put('/api/users', authMiddleware, async (req, res) => {
    const { email, password } = req.body;
    const id = req.user.id; // Get the user ID from the authenticated user

    try {
        // Hash the new password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const updatedUser = await pool.query(
            'UPDATE users SET email = COALESCE($1, email), password = COALESCE($2, password) WHERE id = $3 RETURNING *',
            [email, hashedPassword, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: updatedUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete user
app.delete('/api/users', authMiddleware, async (req, res) => {
    const id = req.user.id; // Get the user ID from the authenticated user

    try {
        const deletedUser = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
