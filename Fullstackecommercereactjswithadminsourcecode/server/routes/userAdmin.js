
const { User } = require('../models/user');
const { PostType } = require('../models/postType');
const express = require('express');
const router = express.Router();

// Get all user admin with pagination and optional location filter
router.get('/userAdmin', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const locationFilter = req.query.location;

    try {
        const query = { isAdmin: true };
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / perPage);

        if (page > totalUsers) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        let users = [];

        if (locationFilter) {
            const allUsers = await User.find(query)
                .populate("name")
                .exec();

                users = allUsers.filter(user =>
                user.location && user.location.some(loc => loc.value === locationFilter)
            ).slice((page - 1) * perPage, page * perPage);
        } else {
            users = await User.find(query)
                .populate("name")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        return res.status(200).json({
            success: true,
            data: users,
            totalUsers,
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new post type
router.post(`/userAdmin/create`, async (req, res) => {
    try {
        let postType = new PostType({
            name: req.body.name,
            note: req.body.note,
        });
        postType = await postType.save();
        res.status(201).json(postType);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating post type", error });
    }
});

// Update a post type
router.put(`/userAdmin/:id`, async (req, res) => {
    try {
        const postType = await PostType.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name,
                note: req.body.note
             },
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

// Get post type by ID
router.get(`/userAdmin/:id`, async (req, res) => {
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

// Get user by Id
router.get('/userAdmin/:id', async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({ success: false, message: 'The user with the given ID was not found.' })
    } else{
        res.status(200).json({ success: true, data: user });
    }
    
})