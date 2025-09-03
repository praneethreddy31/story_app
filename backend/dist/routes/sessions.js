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
router.get('/:projectId/sessions', auth_1.protect, async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.projectId,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.post('/:projectId/sessions', auth_1.protect, [
    (0, express_validator_1.body)('title').optional().isString().withMessage('Title must be a string')
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
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.projectId,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.get('/sessions/:id', auth_1.protect, async (req, res) => {
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
        if (session.project.userId !== req.user.id) {
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
    }
    catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.put('/sessions/:id', auth_1.protect, [
    (0, express_validator_1.body)('title').optional().isString().withMessage('Title must be a string'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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
        if (session.project.userId !== req.user.id) {
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
    }
    catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.delete('/sessions/:id', auth_1.protect, async (req, res) => {
    try {
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
        if (session.project.userId !== req.user.id) {
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
    }
    catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=sessions.js.map