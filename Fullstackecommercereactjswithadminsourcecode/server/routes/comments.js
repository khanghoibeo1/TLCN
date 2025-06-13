const { Comment } = require('../models/comment');
const express = require('express');
const router = express.Router();
const openAI = require("../helper/openai/openAI.js")

// Get all comments for a specific post
router.get('/post/', async (req, res) => {
    try {
        const comments = await Comment.find({postId:req.query.postId});
        if (!comments) {
            return res.status(404).json({ success: false, message: 'No comments found for this post' });
        }
        return res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Add a new comment
// router.post('/add', async (req, res) => {
//     const { content, author, postId } = req.body;
  
//     // Input validation (optional but highly recommended)
//     if (!content || !author || !postId) {
//       return res.status(400).json({ success: false, error: 'Missing required fields' });
//     }
  
//     try {
//       // Validate author object structure (if applicable)
//       if (typeof author !== 'object' || !author.name || !author.userId) {
//         return res.status(400).json({ success: false, error: 'Invalid author object format' });
//       }
  
//       // Create a new comment instance
//       const comment = new Comment({
//         content,
//         author: {
//           name: author.name,
//           userId: author.userId // Assuming userId is an ObjectID
//         },
//         postId
//       });
  
//       // Save the comment to the database
//       const savedComment = await comment.save();
  
//       // Return the saved comment with a success response
//       return res.status(201).json(savedComment);
//     } catch (error) {
//       // Handle errors gracefully
//       console.error(error.message); // Log the error for debugging
//       return res.status(500).json({ success: false, error: 'Internal server error' }); // Generic error message for the user
//     }
//   });

// Add a new comment
// router.post('/add', async (req, res) => {
//   const { content, author, postId, parentId, parentName } = req.body;

//   if (!content || !author || !postId) {
//       return res.status(400).json({ success: false, error: 'Missing required fields' });
//   }

//   try {
//       if (typeof author !== 'object' || !author.name || !author.userId) {
//           return res.status(400).json({ success: false, error: 'Invalid author object format' });
//       }

//       // Nếu có parentId, kiểm tra xem nó có tồn tại không
//       if (parentId) {
//           const parentComment = await Comment.findById(parentId);
//           if (!parentComment) {
//               return res.status(400).json({ success: false, error: 'Parent comment not found' });
//           }
//       }

//       const comment = new Comment({
//           content,
//           author: {
//               name: author.name,
//               userId: author.userId
//           },
//           postId,
//           parentId: parentId || null,
//           parentName: parentName || null
//       });

//       const savedComment = await comment.save();
//       return res.status(201).json(savedComment);
//   } catch (error) {
//       console.error(error.message);
//       return res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });

router.post('/add', async (req, res) => {
    const { content, author, postId, parentId, parentName } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!content || !author || !postId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (typeof author !== 'object' || !author.name || !author.userId) {
        return res.status(400).json({ success: false, error: 'Invalid author object format' });
    }

    try {
        // Kiểm tra sự tồn tại của comment cha (nếu có)
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(400).json({ success: false, error: 'Parent comment not found' });
            }
        }

        // Kiểm tra nội dung không phù hợp bằng AI
        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Bạn là hệ thống phát hiện bình luận không phù hợp. Trả lời 'true' nếu nội dung bên dưới chứa ngôn ngữ độc hại, thô tục, xúc phạm, phân biệt chủng tộc, không phù hợp. Trả lời 'false' nếu bình thường."
                },
                {
                    role: "user",
                    content: `Comment: "${content}"`
                }
            ]
        });

        const isInappropriate = completion.choices[0].message.content.toLowerCase().includes("true");

        if (isInappropriate) {
            return res.status(400).json({
                success: false,
                error: 'Comment content is inappropriate and has been rejected.'
            });
        }

        // Tạo và lưu comment mới
        const comment = new Comment({
            content,
            author: {
                name: author.name,
                userId: author.userId
            },
            postId,
            parentId: parentId || null,
            parentName: parentName || null
        });

        const savedComment = await comment.save();

        return res.status(201).json({ success: true, comment: savedComment });

    } catch (error) {
        console.error('Add comment error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// Delete a comment by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found!' });
        }
        return res.status(200).json({ success: true, message: 'Comment Deleted!' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get a comment by ID
router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'The comment with the given ID was not found.' });
        }
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
