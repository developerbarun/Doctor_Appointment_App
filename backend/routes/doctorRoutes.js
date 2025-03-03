const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

// Add a doctor profile
router.post('/', async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        await doctor.save();
        res.status(201).json(doctor);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all doctors with filters
router.get('/', async (req, res) => {
    try {
        const { specialty, location, name } = req.query;
        let query = {};
        if (specialty) query.specialty = specialty;
        if (location) query.location = location;
        if (name) query.name = { $regex: name, $options: 'i' };

        const doctors = await Doctor.find(query);
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get a single doctor profile
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/availability', async (req, res) => {
    try {
        const { doctorId, date, slots } = req.body;
        await Doctor.updateOne(
            { _id: doctorId },
            { $push: { availability: { date, slots } } }
        );
        res.json({ msg: 'Availability set successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { specialty, location, name } = req.query;
        let query = {};

        if (specialty) query.specialty = new RegExp(specialty, 'i');
        if (location) query.location = new RegExp(location, 'i');
        if (name) query.name = new RegExp(name, 'i');

        const doctors = await Doctor.find(query);
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
