// const { Post } = require('../models/post');
// const express = require('express');
// const router = express.Router();

// // Get all posts
// router.get('/', async (req, res) => {
//     try {
//         const posts = await Post.find(req.query);
//         if (!posts) {
//             return res.status(500).json({ success: false });
//         }
//         return res.status(200).json(posts);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Add a new post
// router.post('/add', async (req, res) => {
//     let post = new Post({
//         title: req.body.title,
//         content: req.body.content,
//         author: req.body.author,
//         slug: req.body.slug,
//         images: req.body.images,
//         tags: req.body.tags
//     });

//     try {
//         post = await post.save();
//         return res.status(201).json(post);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Delete a post by ID
// router.delete('/:id', async (req, res) => {
//     try {
//         const deletedPost = await Post.findByIdAndDelete(req.params.id);
//         if (!deletedPost) {
//             return res.status(404).json({ message: 'Post not found!' });
//         }
//         return res.status(200).json({ success: true, message: 'Post Deleted!' });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Get a post by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'The post with the given ID was not found.' });
//         }
//         return res.status(200).json(post);
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

// module.exports = router;
// -----------------------------------------------------------------------------------------------
const { Post } = require('../models/post');
const express = require('express');
const router = express.Router();

// Get all posts with pagination and optional location filter
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const locationFilter = req.query.location;

    try {
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        let posts = [];

        if (locationFilter) {
            const allPosts = await Post.find()
                .populate("category")
                .exec();

            posts = allPosts.filter(post =>
                post.location && post.location.some(loc => loc.value === locationFilter)
            ).slice((page - 1) * perPage, page * perPage);
        } else {
            posts = await Post.find()
                .populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        return res.status(200).json({
            success: true,
            data: posts,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get post count (excluding child posts if needed)
router.get('/get/count', async (req, res) => {
    try {
        const postCount = await Post.countDocuments({ parentId: undefined });
        return res.status(200).json({ success: true, postCount });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Add a new post
router.post('/add', async (req, res) => {
    const { title, content, author, slug, images, tags, category, status } = req.body;

    let post = new Post({
        title,
        content,
        author,
        slug,
        images,
        tags,
        category,
        status,
        commentsCount: 0,
    });

    try {
        post = await post.save();
        return res.status(201).json({ success: true, data: post });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }
        return res.status(200).json({ success: true, message: 'Post Deleted!' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get a post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'The post with the given ID was not found.' });
        }
        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

