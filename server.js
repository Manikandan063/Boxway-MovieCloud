const app = require('./app');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load from .env if present (used locally)
const connectDB = require('./config/db');


connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Accepting connections on 0.0.0.0`);


});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
