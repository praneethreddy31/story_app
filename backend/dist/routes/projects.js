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
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.id },
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
    }
    catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.post('/', auth_1.protect, [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Project title is required'),
    (0, express_validator_1.body)('genre').optional().isString().withMessage('Genre must be a string'),
    (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string')
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
        const { title, genre, description } = req.body;
        const project = await prisma.project.create({
            data: {
                title,
                genre,
                description,
                userId: req.user.id
            }
        });
        res.status(201).json({
            success: true,
            data: project
        });
    }
    catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
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
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.put('/:id', auth_1.protect, [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('genre').optional().isString().withMessage('Genre must be a string'),
    (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
    (0, express_validator_1.body)('status').optional().isIn(['DRAFT', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED']).withMessage('Invalid status')
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
                id: req.params.id,
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
        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({
            success: true,
            data: updatedProject
        });
    }
    catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
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
        await prisma.project.delete({
            where: { id: req.params.id }
        });
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
router.get('/search', auth_1.protect, async (req, res) => {
    try {
        const query = req.query.query;
        const genre = req.query.genre;
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'updatedAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = { userId: req.user.id };
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
    }
    catch (error) {
        console.error('Search projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map