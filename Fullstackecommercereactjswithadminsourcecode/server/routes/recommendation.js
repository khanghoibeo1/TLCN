const express = require('express');
const router = express.Router();
const { Recommendation } = require('../models/recommendation');
const { Product } = require('../models/products'); // Đảm bảo đã import Product

// GET: Lấy danh sách sản phẩm gợi ý đầy đủ theo userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(userId)

    try {
        const recommendation = await Recommendation.findOne({ userId }).populate('recommendedProducts');

        // Nếu không có gợi ý hoặc mảng gợi ý rỗng
        if (!recommendation || !recommendation.recommendedProducts || recommendation.recommendedProducts.length === 0) {
            const fallbackProducts = await Product.find()
                .sort({ createdAt: -1 }) // sản phẩm mới nhất
                .limit(50); // giới hạn 50 sản phẩm

            return res.status(200).json({
                recommended: fallbackProducts,
                fallback: true // đánh dấu đây là fallback
            });
        }

        // Nếu có gợi ý đầy đủ
        res.status(200).json({
            recommended: recommendation.recommendedProducts,
            fallback: false
        });
    } catch (err) {
        console.error('Lỗi khi lấy gợi ý sản phẩm:', err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy dữ liệu gợi ý.' });
    }
});

module.exports = router;
