import express from 'express';

const router = express.Router();

// Placeholder routes for users
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Users routes will be implemented here' });
});

export default router;
