"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express.Router();
const prisma = new client_1.PrismaClient();
router.get('/:sessionId/messages', auth_1.protect, async (req, res) => {
    try {
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
        if (session.project.userId !== req.user.id) {
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
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.post('/:sessionId/messages', auth_1.protect, [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Message content is required'),
    (0, express_validator_1.body)('sender').isIn(['USER', 'AI']).withMessage('Sender must be USER or AI')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: errors.array()[0].msg
            });
            return;
        }
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
        if (session.project.userId !== req.user.id) {
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
        await prisma.session.update({
            where: { id: req.params.sessionId },
            data: { updatedAt: new Date() }
        });
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map