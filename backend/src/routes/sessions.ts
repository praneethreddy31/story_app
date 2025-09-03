import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all sessions for a project
// @route   GET /api/projects/:projectId/sessions
// @access  Private
router.get('/:projectId/sessions', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const sessions = await prisma.session.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new session
// @route   POST /api/projects/:projectId/sessions
// @access  Private
router.post('/:projectId/sessions', protect, [
  body('title').optional().isString().withMessage('Title must be a string')
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    const session = await prisma.session.create({
      data: {
        projectId: req.params.projectId,
        title: req.body.title || `Session ${new Date().toLocaleDateString()}`
      }
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get session by ID with messages
// @route   GET /api/sessions/:id
// @access  Private
router.get('/sessions/:id', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const session = await prisma.session.findFirst({
      where: { id: req.params.id },
      include: {
        project: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
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

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
router.put('/sessions/:id', protect, [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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
      where: { id: req.params.id },
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

    const updatedSession = await prisma.session.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private
router.delete('/sessions/:id', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    // Verify session ownership through project
    const session = await prisma.session.findFirst({
      where: { id: req.params.id },
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

    await prisma.session.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
