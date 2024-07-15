// server.js
// Implement basic user CRUD and authentication
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', userRoutes);

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