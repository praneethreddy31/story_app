import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all messages for a session
// @route   GET /api/sessions/:sessionId/messages
// @access  Private
router.get('/:sessionId/messages', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // Verify session ownership through project
    const session = await prisma.session.findFirst({
      where: { id: req.params.sessionId },
      include: {
        project: true
      }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
      return;
    }

    // Verify project ownership
    if (session.project.userId !== req.user!.id) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { sessionId: req.params.sessionId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Send message to session (user message)
// @route   POST /api/sessions/:sessionId/messages
// @access  Private
router.post('/:sessionId/messages', protect, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('sender').isIn(['USER', 'AI']).withMessage('Sender must be USER or AI')
], async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
      return;
    }

    // Verify session ownership through project
    const session = await prisma.session.findFirst({
      where: { id: req.params.sessionId },
      include: {
        project: true
      }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
      return;
    }

    // Verify project ownership
    if (session.project.userId !== req.user!.id) {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
      return;
    }

    const message = await prisma.message.create({
      data: {
        sessionId: req.params.sessionId,
        content: req.body.content,
        sender: req.body.sender
      }
    });

    // Update session timestamp
    await prisma.session.update({
      where: { id: req.params.sessionId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// TODO: Fix remaining route handlers
// Temporarily commenting out problematic routes to get backend running

export default router;
