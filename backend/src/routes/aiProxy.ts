import express, { Request, Response } from 'express'; // <-- Add Request and Response here
import axios from 'axios';
import { protect } from '../middleware/auth'; // Your existing security middleware

const router = express.Router();

// The 'protect' part ensures only logged-in users can do this
router.post('/generate', protect, async (req: Request, res: Response) => { // <-- Add the types here
    try {
        // 1. The Manager looks up the Kitchen's address and the secret key
        const aiServiceUrl = process.env.AI_SERVICE_URL;
        const internalApiKey = process.env.INTERNAL_API_KEY;

        // 2. The Manager securely calls the Kitchen, sending the customer's order (req.body)
        //    and showing his secret key (the Authorization header)
        const response = await axios.post(
            `${aiServiceUrl}/api/v1/conversational/generate`, // The path to the kitchen's order window
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${internalApiKey}`
                }
            }
        );

        // 3. The Manager brings the dish (the AI's response) back to the customer
        res.json(response.data);

    } catch (error: any) {
        console.error('Error proxying request to AI service:', error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI service.' });
    }
});

export default router;

