require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`PhishQuest Server is running on port ${PORT}`);
  });
});
