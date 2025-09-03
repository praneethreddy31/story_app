import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Save conversation
router.post('/', protect, async (req: any, res: express.Response): Promise<void> => {
  try {
    const { projectId, messages } = req.body;
    const userId = req.user!.id;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      }
    });

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Save or update conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        projectId: projectId
      },
      update: {
        messages: JSON.stringify(messages),
        updatedAt: new Date()
      },
      create: {
        projectId: projectId,
        userId: userId,
        messages: JSON.stringify(messages)
      }
    });

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to save conversation' });
  }
});

// Get conversation by project ID
router.get('/:projectId', protect, async (req: any, res: express.Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      }
    });

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        projectId: projectId,
        userId: userId
      }
    });

    if (conversation) {
      const messages = JSON.parse(conversation.messages);
      res.json({ success: true, data: { messages } });
    } else {
      res.json({ success: true, data: { messages: [] } });
    }
  } catch (error) {
    console.error('Error loading conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to load conversation' });
  }
});

export default router;
