const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const protect = require('../middleware/auth');

// @GET /api/leads - Get all leads (with search & filter)
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/leads - Create a new lead
router.post('/', protect, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/leads/analytics - Get analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ status: 'converted' });
    const contacted = await Lead.countDocuments({ status: 'contacted' });
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    res.json({ total, converted, contacted, newLeads, conversionRate });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/leads/:id - Get single lead
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PATCH /api/leads/:id/status - Update lead status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/leads/:id/notes - Add a note to a lead
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text: req.body.text });
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/leads/:id - Update lead details
router.put('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;