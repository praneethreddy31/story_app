"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const { projectId, messages } = req.body;
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ success: false, error: 'Failed to save conversation' });
    }
});
router.get('/:projectId', auth_1.protect, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
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
        }
        else {
            res.json({ success: true, data: { messages: [] } });
        }
    }
    catch (error) {
        console.error('Error loading conversation:', error);
        res.status(500).json({ success: false, error: 'Failed to load conversation' });
    }
});
exports.default = router;
//# sourceMappingURL=conversations.js.map