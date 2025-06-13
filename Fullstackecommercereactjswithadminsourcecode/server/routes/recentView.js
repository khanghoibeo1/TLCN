const express = require('express');
const { RecentView } = require('../models/recentView');
const router = express.Router();


router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Missing userId"
        });
    }

    try {
        const userRecentView = await RecentView.findOne({ userId }).populate({
            path: 'viewedProducts.productId',
            select: 'name rating category brand subCatName season'
        });

        if (!userRecentView) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            data: userRecentView.viewedProducts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});


router.post('/add', async (req, res) => {
    const { userId, productId } = req.query;

    if (!userId || !productId) {
        return res.status(400).json({
            success: false,
            message: "Missing userId or productId"
        });
    }

    try {
        let userRecentView = await RecentView.findOne({ userId });

        if (!userRecentView) {
            // Chưa có document -> tạo mới
            userRecentView = new RecentView({
                userId,
                viewedProducts: [{ productId }]
            });
        } else {
            // Đã có document
            // Xoá nếu đã tồn tại productId
            userRecentView.viewedProducts = userRecentView.viewedProducts.filter(
                (item) => item.productId.toString() !== productId
            );

            // Thêm mới vào đầu
            userRecentView.viewedProducts.unshift({
                productId,
                viewedAt: new Date()
            });

            // Giữ lại tối đa 30
            if (userRecentView.viewedProducts.length > 30) {
                userRecentView.viewedProducts = userRecentView.viewedProducts.slice(0, 30);
            }
        }

        const saved = await userRecentView.save();
        return res.status(200).json({
            success: true,
            data: saved
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

module.exports = router;
