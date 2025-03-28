const express = require("express");
const { PostType } = require("../models/postType");
const router = express.Router();

// Get all post types
router.get(`/`, async (req, res) => {
    try {
        const postTypes = await PostType.find();
        res.status(200).json(postTypes);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching post types", error });
    }
});

// Get post type by ID
router.get(`/:id`, async (req, res) => {
    try {
        const postType = await PostType.findById(req.params.id);
        if (!postType) {
            return res.status(404).json({ success: false, message: "Post type not found" });
        }
        res.status(200).json(postType);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching post type", error });
    }
});

// Create a new post type
router.post(`/create`, async (req, res) => {
    try {
        let postType = new PostType({
            name: req.body.name,
        });
        postType = await postType.save();
        res.status(201).json(postType);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating post type", error });
    }
});

// Update a post type
router.put(`/:id`, async (req, res) => {
    try {
        const postType = await PostType.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        if (!postType) {
            return res.status(404).json({ success: false, message: "Post type not found" });
        }
        res.status(200).json(postType);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating post type", error });
    }
});

// Delete a post type
router.delete(`/:id`, async (req, res) => {
    try {
        const postType = await PostType.findByIdAndDelete(req.params.id);
        if (!postType) {
            return res.status(404).json({ success: false, message: "Post type not found" });
        }
        res.status(200).json({ success: true, message: "Post type deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting post type", error });
    }
});

module.exports = router;
