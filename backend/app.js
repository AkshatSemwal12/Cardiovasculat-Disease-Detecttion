
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cvdRoutes = require('./routes/cvdRoutes');

const app = express();

// Middleware
app.use(express.json()); // JSON parsing
app.use(cors()); // Enable CORS

// Routes
app.use('/cvd', cvdRoutes); // Ensure that your frontend makes requests to /cvd/detect

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/cvd_project';
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));


// Start the server
const PORT = process.env.PORT || 5000; // Allow PORT to be set in environment variables
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
