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
const conversations_1 = __importDefault(require("./routes/conversations"));
const aiProxy_1 = __importDefault(require("./routes/aiProxy"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
console.log("--- SERVER BOOTING UP: VERSION WITH AI PROXY DEBUG LOGS ---");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
const io = new socket_io_1.Server(server, {
    cors: {
        origin: frontendUrl,
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
    origin: frontendUrl,
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(limiter);
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/conversations', conversations_1.default);
app.use('/api/ai', aiProxy_1.default);
console.log("--- AI PROXY ROUTE has been successfully registered. ---");
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map