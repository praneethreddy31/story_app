import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        sessions: {
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, [
  body('title').notEmpty().withMessage('Project title is required'),
  body('genre').optional().isString().withMessage('Genre must be a string'),
  body('description').optional().isString().withMessage('Description must be a string')
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

    const { title, genre, description } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        genre,
        description,
        userId: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        sessions: {
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('genre').optional().isString().withMessage('Genre must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED']).withMessage('Invalid status')
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

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
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

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
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

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Private
router.get('/search', protect, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const query = req.query.query as string;
    const genre = req.query.genre as string;
    const status = req.query.status as string;
    const sortBy = (req.query.sortBy as string) || 'updatedAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const skip = (page - 1) * limit;
    
    const where: any = { userId: req.user!.id };
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (genre) {
      where.genre = genre;
    }
    
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          sessions: {
            orderBy: { updatedAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
