import express from 'express';

const router = express.Router();

// Placeholder routes for plots
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Plots routes will be implemented here' });
});

export default router;
