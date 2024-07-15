// Implement basic user CRUD and authentication
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const User = require('./models/User');

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
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });

        const token = generateToken(newUser);
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
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate and send JWT token
        const token = generateToken(user);
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

        // Create an object with the fields to update
        const updatedFields = {};
        if (email) updatedFields.email = email;
        if (hashedPassword) updatedFields.password = hashedPassword;

        // Check if there are fields to update
        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        // Update the user using Sequelize's update method
        const [affectedRows] = await User.update(updatedFields, {
            where: { id }
        });

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch the updated user to return in the response
        const updatedUser = await User.findByPk(id);

        res.json({ user: updatedUser });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete user
app.delete('/api/users', authMiddleware, async (req, res) => {
    const id = req.user.id; // Get the user ID from the authenticated user

    try {
        // Use Sequelize to delete the user
        const deletedUser = await User.destroy({
            where: { id }
        });

        if (deletedUser === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await sequelize.sync();
        console.log('Database synchronized');
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

startServer();