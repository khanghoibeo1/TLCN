// const { Comment } = require('../models/comment');
// const express = require('express');
// const router = express.Router();

// // Get all comments for a specific post
// router.get('/post/:postId', async (req, res) => {
//     try {
//         const comments = await Comment.find({ postId: req.params.postId });
//         if (!comments) {
//             return res.status(404).json({ success: false, message: 'No comments found for this post' });
//         }
//         return res.status(200).json(comments);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });



// // Add a new comment
// router.post('/add', async (req, res) => {
//     let comment = new Comment({
//         content: req.body.content,
//         author: req.body.author,
//         postId: req.body.postId,
//         parentId: req.body.parentId || null
//     });

//     try {
//         comment = await comment.save();
//         return res.status(201).json(comment);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Delete a comment by ID
// router.delete('/:id', async (req, res) => {
//     try {
//         const deletedComment = await Comment.findByIdAndDelete(req.params.id);
//         if (!deletedComment) {
//             return res.status(404).json({ message: 'Comment not found!' });
//         }
//         return res.status(200).json({ success: true, message: 'Comment Deleted!' });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Get a comment by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const comment = await Comment.findById(req.params.id);
//         if (!comment) {
//             return res.status(404).json({ message: 'The comment with the given ID was not found.' });
//         }
//         return res.status(200).json(comment);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// module.exports = router;
// ----------------------------------------------------------------------
const { Comment } = require('../models/comment');
const express = require('express');
const router = express.Router();

// Get all comments for a specific post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        if (!comments) {
            return res.status(404).json({ success: false, message: 'No comments found for this post' });
        }
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Add a new comment
router.post('/add', async (req, res) => {
    const { content, author, postId } = req.body;

    let comment = new Comment({
        content,
        author,
        postId,
    });

    try {
        comment = await comment.save();
        return res.status(201).json(comment);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
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
