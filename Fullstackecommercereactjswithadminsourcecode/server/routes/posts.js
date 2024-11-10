const { Post } = require('../models/post');
const express = require('express');
const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(req.query);
        if (!posts) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Add a new post
router.post('/add', async (req, res) => {
    let post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        slug: req.body.slug,
        images: req.body.images,
        tags: req.body.tags
    });

    try {
        post = await post.save();
        return res.status(201).json(post);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found!' });
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
            return res.status(404).json({ message: 'The post with the given ID was not found.' });
        }
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
