const { Post } = require("../models/post.js");
const express = require("express");
const router = express.Router();

// Tìm kiếm bài viết
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;

    // Lấy tham số page và perPage từ query params
    const page = parseInt(req.query.page) || 1; // Default to 1 if not provided
    const perPage = parseInt(req.query.perPage) || 10; // Default to 10 if not provided
    let totalPosts = 0;
    let totalPages = 0;

    // Kiểm tra xem query có tồn tại hay không
    if (!query) {
      return res.status(400).json({ msg: "Query is required" });
    }

    // Tìm kiếm bài viết với các tiêu chí
    const searchConditions = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    };

    // Nếu có tham số page và perPage, thực hiện phân trang
    if (page && perPage) {
      // Tìm các bài viết với phân trang
      const items = await Post.find(searchConditions)
        .skip((page - 1) * perPage)  // Bỏ qua các bài viết đã qua
        .limit(perPage)  // Giới hạn số lượng bài viết trả về
        .populate("category");

      // Tính tổng số bài viết
      totalPosts = await Post.countDocuments(searchConditions);

      // Tính tổng số trang
      totalPages = Math.ceil(totalPosts / perPage);

      return res.status(200).json({
        posts: items,
        totalPages: totalPages,
        page: page,
        totalPosts: totalPosts,
      });
    } else {
      // Nếu không có phân trang, trả về tất cả bài viết khớp với query
      const items = await Post.find(searchConditions).populate("category");

      return res.json(items);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
