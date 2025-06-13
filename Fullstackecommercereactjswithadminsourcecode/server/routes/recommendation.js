const express = require('express');
const router = express.Router();
const { Recommendation } = require('../models/recommendation');

// GET: Lấy danh sách sản phẩm gợi ý đầy đủ theo userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const recommendation = await Recommendation.findOne({ userId }).populate('recommendedProducts');

        if (!recommendation) {
            return res.status(404).json({ error: 'Không tìm thấy gợi ý cho người dùng này.' });
        }

        res.status(200).json({
            recommended: recommendation.recommendedProducts
        });
    } catch (err) {
        console.error('Lỗi khi lấy gợi ý sản phẩm:', err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy dữ liệu gợi ý.' });
    }
});

module.exports = router;
