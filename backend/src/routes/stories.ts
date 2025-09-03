import express from 'express';

const router = express.Router();

// Placeholder routes for stories
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Stories routes will be implemented here' });
});

export default router;
