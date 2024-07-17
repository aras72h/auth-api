// controllers/userController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For generating tokens
const { Op } = require('sequelize');
const sendEmail = require('../utils/mail');





const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// Register new user
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    // Simple email validation regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is valid
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

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
};


// Login user
exports.loginUser = async (req, res) => {
    console.log('Login request received'); // Add this line
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
};


// Update user
exports.updateUser = async (req, res) => {
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
};


// Delete user
exports.deleteUser = async (req, res) => {
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
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save the token to the user (consider setting an expiry as well)
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Construct the reset link
        const resetLink = `${process.env.PROD_DOMAIN}/api/auth/reset-password?token=${resetToken}`;
        // Send email with reset link
        sendEmail(user.email, 'Password Reset Request', `Reset your password using this link: ${resetLink}`);
        res.json({ message: 'Password reset link has been sent to email address.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
};


exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: Date.now() } // Ensure token is not expired
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: 'Password has been reset.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
};


exports.verifyResetToken = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: Date.now() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        res.json({ message: 'Valid token', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
};