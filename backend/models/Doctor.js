const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const DoctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: { type: String, required: true },
    experience: { type: Number, required: true },
    location: { type: String, required: true },
    availability: [{ type: String }] // List of available time slots
});

module.exports = mongoose.model('Doctor', DoctorSchema);