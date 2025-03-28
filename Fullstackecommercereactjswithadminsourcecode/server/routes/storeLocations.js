const express = require("express");
const { StoreLocation } = require("../models/storeLocation");
const router = express.Router();

// Lấy tất cả store locations với format mong muốn
router.get(`/`, async (req, res) => {
    try {
        const locations = await StoreLocation.find();
        
        const formattedData = locations.map(loc => ({
            id: loc._id.toHexString(), // Thêm id vào dữ liệu
            iso2: loc.iso2,
            location: loc.location,
            detailAddress: loc.detailAddress
        }));

        res.status(200).json({
            error: false,
            msg: "Countries and locations retrieved",
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            msg: "Error fetching store locations", 
            details: error.message 
        });
    }
});

// Lấy store location theo ID với format mong muốn
router.get(`/:id`, async (req, res) => {
    try {
        const loc = await StoreLocation.findById(req.params.id);
        if (!loc) {
            return res.status(404).json({ error: true, msg: "Store location not found" });
        }

        res.status(200).json({
            error: false,
            msg: "Store location retrieved",
            data: {
                id: loc._id.toHexString(), // Thêm id vào dữ liệu
                iso2: loc.iso2,
                location: loc.location,
                detailAddress: loc.detailAddress
            }
        });
    } catch (error) {
        res.status(500).json({ error: true, msg: "Error fetching store location", details: error.message });
    }
});

// Tạo một store location mới
router.post(`/create`, async (req, res) => {
    try {
        let location = new StoreLocation({
            iso2: req.body.iso2,
            location: req.body.location,
            detailAddress: req.body.detailAddress
        });

        location = await location.save();
        res.status(201).json({
            error: false,
            msg: "Store location created",
            data: {
                id: location._id.toHexString(), // Thêm id vào dữ liệu
                iso2: location.iso2,
                location: location.location,
                detailAddress: location.detailAddress
            }
        });
    } catch (error) {
        res.status(500).json({ error: true, msg: "Error creating store location", details: error.message });
    }
});

// Cập nhật store location
router.put(`/:id`, async (req, res) => {
    try {
        const location = await StoreLocation.findByIdAndUpdate(
            req.params.id,
            {
                iso2: req.body.iso2,
                location: req.body.location,
                detailAddress: req.body.detailAddress
            },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ error: true, msg: "Store location not found" });
        }

        res.status(200).json({
            error: false,
            msg: "Store location updated",
            data: {
                id: location._id.toHexString(), // Thêm id vào dữ liệu
                iso2: location.iso2,
                location: location.location,
                detailAddress: location.detailAddress
            }
        });
    } catch (error) {
        res.status(500).json({ error: true, msg: "Error updating store location", details: error.message });
    }
});

// Xóa store location
router.delete(`/:id`, async (req, res) => {
    try {
        const location = await StoreLocation.findByIdAndDelete(req.params.id);
        if (!location) {
            return res.status(404).json({ error: true, msg: "Store location not found" });
        }

        res.status(200).json({ error: false, msg: "Store location deleted successfully", id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: true, msg: "Error deleting store location", details: error.message });
    }
});

module.exports = router;
