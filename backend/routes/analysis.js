const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameLog = require('../models/GameLog');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST api/analysis/:id
// @desc    Analyze a game log
// @access  Private
router.post('/:id', auth, async (req, res) => {
    try {
        const game = await GameLog.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const gameLogText = game.logs.join('\n');
        
        const prompt = `Dựa vào log của một ván cờ Cờ Tỷ Phú Việt Nam (Kỳ Sử Lạc Hồng) dưới đây, hãy phân tích lối chơi của những người tham gia. Đưa ra nhận xét về các quyết định quan trọng và đề xuất các chiến thuật có thể cải thiện cho ván sau. Phân tích cần ngắn gọn, tập trung vào chiến thuật. Log game: \n\n${gameLogText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ analysis: text });

    } catch (err) {
        console.error('Error analyzing game with Gemini:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;