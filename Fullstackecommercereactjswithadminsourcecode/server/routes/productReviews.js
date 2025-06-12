const { ProductReviews } = require('../models/productReviews');
const { Product } = require('../models/products');
const express = require('express');
const router = express.Router();
const openAI = require("../helper/openai/openAI.js")
const {authenticateToken } = require("../middleware/authenticateToken");  // Đảm bảo openAi.js được require đúng

const AI_USER_ID = process.env.AI_USER_ID; 

router.get(`/`, async (req, res) => {

    let  reviews=[];

    try {

        if(req.query.productId!==undefined && req.query.productId!==null && req.query.productId!=="" ){
            reviews = await ProductReviews.find({ productId: req.query.productId });
        }else{
            reviews = await ProductReviews.find();
        }


        if (!reviews) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ success: false })
    }


});

router.get(`/get/count`, async (req, res) =>{
    const productsReviews = await ProductReviews.countDocuments()

    if(!productsReviews) {
        res.status(500).json({success: false})
    } else{
        res.send({
            productsReviews: productsReviews
        });
    }
   
})



router.get('/:id', async (req, res) => {

    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
        res.status(500).json({ message: 'The review with the given ID was not found.' })
    }
    return res.status(200).send(review);
})




router.post('/add', async (req, res) => {
    //AVERAGE AND LIMITED REVIEW IN A DAY
    try {
        const { customerId, customerName, review, customerRating, productId } = req.body;

        // Lấy thời gian bắt đầu và kết thúc của ngày hôm nay
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);  // Lấy giờ bắt đầu ngày hôm nay
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  // Lấy giờ kết thúc ngày hôm nay

        // Kiểm tra xem người dùng đã đánh giá sản phẩm này trong ngày hôm nay chưa
        const existingReview = await ProductReviews.findOne({
            customerId: customerId,
            productId: productId,
            dateCreated: { $gte: todayStart, $lt: todayEnd }
        });

        // Nếu đã đánh giá trong ngày hôm nay, trả về lỗi
        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product today.'
            });
        }

        // Kiểm tra bình luận có độc hại không bằng AI
        const completion = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
            role: "system",
            content: "Bạn là một hệ thống phát hiện bình luận không phù hợp. Trả lời 'true' nếu nội dung dưới đây chứa ngôn ngữ độc hại, thô tục, xúc phạm, phân biệt chủng tộc, hoặc không phù hợp. Trả lời 'false' nếu bình thường."
            },
            {
            role: "user",
            content: `Review: "${review}"`
            }
        ]
        });

        const isInappropriate = completion.choices[0].message.content.toLowerCase().includes("true");

        if (isInappropriate) {
        return res.status(400).json({
            success: false,
            error: "The comment content is inappropriate and has been rejected."
        });
        }

        // Tạo mới một review
        let newReview = new ProductReviews({
            customerId,
            customerName,
            review,
            customerRating,
            productId
        });

        // Lưu review vào cơ sở dữ liệu
        newReview = await newReview.save();

        // Lấy tất cả review của sản phẩm này
        const allReviews = await ProductReviews.find({ productId });

        // Tính toán điểm trung bình của tất cả các review
        const totalRating = allReviews.reduce((acc, cur) => acc + cur.customerRating, 0);
        const averageRating = totalRating / allReviews.length;

        // Cập nhật rating mới cho sản phẩm
        await Product.findByIdAndUpdate(productId, { rating: averageRating });

        // Trả về phản hồi với review mới và rating đã cập nhật
        res.status(201).json({
            success: true,
            review: newReview,
            updatedRating: averageRating
        });
    } catch (err) {
        // Xử lý lỗi và trả về phản hồi lỗi
        res.status(500).json({
            error: err.message,
            success: false
        });
    }

});

// DELETE a review by ID
router.delete('/:id', async (req, res) => {
    try {
        const review = await ProductReviews.findByIdAndDelete(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Cập nhật lại rating sản phẩm nếu cần
        const productId = review.productId;
        const remainingReviews = await ProductReviews.find({ productId });

        if (remainingReviews.length > 0) {
            const totalRating = remainingReviews.reduce((acc, cur) => acc + cur.customerRating, 0);
            const averageRating = totalRating / remainingReviews.length;
            await Product.findByIdAndUpdate(productId, { rating: averageRating });
        } else {
            await Product.findByIdAndUpdate(productId, { rating: 0 });
        }

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// API để thống kê số bình luận theo số sao từ 1 đến 5
router.get('/get/reviews/stats', async (req, res) => {
    try {
      // Sử dụng aggregation pipeline để đếm số lượng đánh giá theo mỗi mức sao từ 1 đến 5
      const statistics = await ProductReviews.aggregate([
        {
          $group: {
            _id: "$customerRating",  // Group by customerRating (số sao)
            count: { $sum: 1 }  // Tính tổng số bình luận cho mỗi mức sao
          }
        },
        {
          $match: { _id: { $gte: 1, $lte: 5 } }  // Lọc số sao trong khoảng từ 1 đến 5
        },
        {
          $sort: { _id: 1 }  // Sắp xếp kết quả theo số sao từ thấp đến cao
        }
      ]);
  
      // Nếu không có đánh giá nào, gán giá trị mặc định
      const result = [];
      for (let i = 1; i <= 5; i++) {
        const stat = statistics.find(item => item._id === i);
        result.push({
          rating: i,
          count: stat ? stat.count : 0  // Nếu không có bình luận, gán là 0
        });
      }
  
      res.status(200).json(result);  // Trả về kết quả thống kê
    } catch (error) {
      res.status(500).json({ message: "Error fetching statistics", error });
    }
  });

module.exports = router;

