const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const nodemailer = require('nodemailer');
const { authMiddleware } = require('./middleware/authMiddleware');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.get("/", (req,res) => {
    res.send("Hello");
})

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);

module.exports = app;

// Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));