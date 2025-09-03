"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const messages_1 = __importDefault(require("./routes/messages"));
const stories_1 = __importDefault(require("./routes/stories"));
const characters_1 = __importDefault(require("./routes/characters"));
const plots_1 = __importDefault(require("./routes/plots"));
const users_1 = __importDefault(require("./routes/users"));
const ai_1 = __importDefault(require("./routes/ai"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:4200"],
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:4200"],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/stories', stories_1.default);
app.use('/api/characters', characters_1.default);
app.use('/api/plots', plots_1.default);
app.use('/api/users', users_1.default);
app.use('/api/ai', ai_1.default);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-story', (storyId) => {
        socket.join(`story-${storyId}`);
        console.log(`User ${socket.id} joined story ${storyId}`);
    });
    socket.on('story-update', (data) => {
        socket.to(`story-${data.storyId}`).emit('story-updated', data);
    });
    socket.on('typing', (data) => {
        socket.to(`story-${data.storyId}`).emit('user-typing', {
            userId: data.userId,
            name: data.name
        });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
//# sourceMappingURL=index.js.map