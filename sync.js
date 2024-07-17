const sequelize = require('./config/db');
const User = require('./models/User');

const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false }); // use { force: true } for development to drop tables
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        process.exit();
    }
};

syncDatabase();