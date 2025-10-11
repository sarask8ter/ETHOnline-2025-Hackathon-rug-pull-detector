const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json({
      message: 'Alerts endpoint',
      alerts: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.json({
      message: 'Alert created',
      alert: req.body
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;