const express = require("express");
const { StoreLocation } = require("../models/storeLocation");
const {Product} = require('../models/products');
const router = express.Router();

// Lấy tất cả store locations với format mong muốn
router.get(`/`, async (req, res) => {
    try {
        const locations = await StoreLocation.find();
        
        const formattedData = locations.map(loc => ({
            id: loc._id.toHexString(), // Thêm id vào dữ liệu
            iso2: loc.iso2,
            location: loc.location,
            detailAddress: loc.detailAddress,
            lat: loc.lat,
            lng: loc.lng,
            note: loc.note
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
                detailAddress: loc.detailAddress,
                lat: loc.lat,
                lng: loc.lng,
                note: loc.note
            }
        });
    } catch (error) {
        res.status(500).json({ error: true, msg: "Error fetching store location", details: error.message });
    }
});

// 👇 Hàm cập nhật tất cả sản phẩm khi tạo location
const addNewLocationToAllProducts = async (newLocationId) => {
    const products = await Product.find();
  
    for (const product of products) {
      const exists = product.amountAvailable.some(
        (entry) => entry.locationId.toString() === newLocationId.toString()
      );
  
      if (!exists) {
        product.amountAvailable.push({
          locationId: newLocationId,
          quantity: 0,
        });
        await product.save();
      }
    }
  };

// Tạo một store location mới
router.post(`/create`, async (req, res) => {
    try {
        let location = new StoreLocation({
            iso2: req.body.iso2,
            location: req.body.location,
            detailAddress: req.body.detailAddress,
            lat: req.body.lat,
            lng: req.body.lng,
            note: req.body.note,
        });
        

        location = await location.save();
        console.log(location.id)
        // gọi hàm cập nhật
        await addNewLocationToAllProducts(location.id);
        res.status(201).json({
            error: false,
            msg: "Store location created",
            data: {
                id: location._id.toHexString(), // Thêm id vào dữ liệu
                iso2: location.iso2,
                location: location.location,
                detailAddress: location.detailAddress,
                lat: location.lat,
                lng: location.lng,
                note: location.note,
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
                detailAddress: req.body.detailAddress,
                lat: req.body.lat,
                lng: req.body.lng,
                note: req.body.note,
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
                detailAddress: location.detailAddress,
                lat: location.lat,
                lng: location.lng,
                note: location.note,
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
