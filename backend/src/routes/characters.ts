import express from 'express';

const router = express.Router();

// Placeholder routes for characters
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Characters routes will be implemented here' });
});

export default router;
