const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);