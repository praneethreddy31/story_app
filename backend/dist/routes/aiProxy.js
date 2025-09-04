"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/generate', auth_1.protect, async (req, res) => {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL;
        const internalApiKey = process.env.INTERNAL_API_KEY;
        const response = await axios_1.default.post(`${aiServiceUrl}/api/v1/conversational/conversation`, req.body, {
            headers: {
                'Authorization': `Bearer ${internalApiKey}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error proxying request to AI service:', error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI service.' });
    }
});
exports.default = router;
//# sourceMappingURL=aiProxy.js.map