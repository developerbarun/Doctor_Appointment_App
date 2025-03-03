const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Book an appointment

router.get('/', async (req, res) => {
    try {
        let appointments;
        if (req.user.role === 'doctor') {
            appointments = await Appointment.find({ doctorId: req.user.id });
        } else if (req.user.role === 'patient') {
            appointments = await Appointment.find({ patientId: req.user.id });
        } else {
            return res.status(403).json({ msg: 'Unauthorized access' });
        }
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { doctorId, patientId, date, timeSlot } = req.body;
        const existingAppointment = await Appointment.findOne({ doctorId, date, timeSlot });
        if (existingAppointment) {
            return res.status(400).json({ msg: 'Time slot already booked' });
        }
        
        const appointment = new Appointment({ doctorId, patientId, date, timeSlot });
        await appointment.save();
        
        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email,
            subject: 'Appointment Confirmation',
            text: `Your appointment is confirmed for ${date} at ${timeSlot}.`
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err);
            else console.log('Email sent: ' + info.response);
        });
        
        res.status(201).json(appointment);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/book', async (req, res) => {
    try {
        const { doctorId, patientId, date, slot } = req.body;
        
        const existingAppointment = await Appointment.findOne({ doctorId, date, slot, status: 'booked' });
        if (existingAppointment) {
            return res.status(400).json({ msg: 'Slot already booked' });
        }

        const appointment = new Appointment({ doctorId, patientId, date, slot });
        await appointment.save();

        // Update doctor's availability by removing the booked slot
        await Doctor.updateOne(
            { _id: doctorId, 'availability.date': date },
            { $pull: { 'availability.$.slots': slot } }
        );

        const patient = await User.findById(patientId);
        if (patient) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: patient.email,
                subject: 'Appointment Confirmation',
                text: `Your appointment with doctor ${doctorId} on ${date} at ${slot} has been booked.`
            });
        }

        res.json({ msg: 'Appointment booked successfully', appointment });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Cancel an appointment
router.post('/cancel', async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
        
        appointment.status = 'cancelled';
        await appointment.save();

        // Restore the cancelled slot in the doctor's availability
        await Doctor.updateOne(
            { _id: appointment.doctorId, 'availability.date': appointment.date },
            { $push: { 'availability.$.slots': appointment.slot } }
        );

        const patient = await User.findById(appointment.patientId);
        if (patient) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: patient.email,
                subject: 'Appointment Cancellation',
                text: `Your appointment on ${appointment.date} at ${appointment.slot} has been cancelled.`
            });
        }

        res.json({ msg: 'Appointment cancelled successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
        
        appointment.status = 'cancelled';
        await appointment.save();
        
        res.json({ msg: 'Appointment cancelled' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;