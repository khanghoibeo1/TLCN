const express = require("express"); 
const { BatchCode } = require("../models/batchCode");
const { Product } = require("../models/products");
const router = express.Router();
const mongoose = require('mongoose');

// Get all batch codes
router.get(`/`, async (req, res) => {
    try {
        const  locationId  = req.query.locationId;
        const  locationName  = req.query.locationName;
        console.log(locationId)
        let query = {};
        if (locationId != "null") {
            query = { locationId: locationId, status: "delivered" };
        }
        else{
            query = {locationName: ""};
        }
        console.log(query)

        const batches = await BatchCode.find(query);
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching batch codes", error });
    }
});

// Get all batch codes of store location
router.get(`/locationBatchCode`, async (req, res) => {
    try {
        const  locationId  = req.query.locationId;
        let query = {
            locationId: locationId,
            $and: [
                { locationName: { $ne: null } },
                { locationName: { $ne: "" } }
            ]
        }; // Lọc locationId khác null và ""
        if(locationId === "null"){
            query = { locationName: { $ne: null, $ne: "" } };
        }
        const batches = await BatchCode.find(query);
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching batch codes", error });
    }
});



// Get batch code by ID
router.get(`/:id`, async (req, res) => {
    try {
        const batch = await BatchCode.findById(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch code not found" });
        }
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching batch code", error });
    }
});

// Create a new batch code
router.post(`/create`, async (req, res) => {
    try {
        console.log(req.body)
        let batchName = `${req.body.productName}-${req.body.productName}-${req.body.importDate}`;
        let batch = new BatchCode({
            batchName: batchName,
            productId: req.body.productId,
            productName: req.body.productName,
            amount: req.body.amount,
            amountRemain: req.body.amount,
            importDate: req.body.importDate,
            expiredDate: req.body.expiredDate,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            discount: req.body.discount,
            locationName: req.body.locationName,
            locationId: req.body.locationId ? req.body.locationId : undefined,
            status: req.body.locationName ? req.body.status : "delivered",
            note: req.body.note,
        });
        batch = await batch.save();
        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating batch code", error });
    }
});

// Update a batch code
router.put(`/:id`, async (req, res) => {
    try {
        const batch = await BatchCode.findByIdAndUpdate(
            req.params.id,
            {
                batchName: req.body.batchName,
                productId: req.body.productId,
                productName: req.body.productName,
                amount: req.body.amount,
                importDate: req.body.importDate,
                expiredDate: req.body.expiredDate,
                price: req.body.price,
                oldPrice: req.body.oldPrice,
                discount: req.body.discount,
                locationName: req.body.locationName,
                locationId: req.body.locationId ? req.body.locationId : undefined,
                status: req.body.status,
                note: req.body.note,
            },
            { new: true }
        );
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch code not found" });
        }
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating batch code", error });
    }
});

// Delete a batch code
router.delete(`/:id`, async (req, res) => {
    try {
        const batch = await BatchCode.findByIdAndDelete(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch code not found" });
        }
        res.status(200).json({ success: true, message: "Batch code deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting batch code", error });
    }
});

// // Update status of a batch code
// router.post(`/:id/status`, async (req, res) => {
//     try {
//         const { status } = req.body;

//         const batch = await BatchCode.findByIdAndUpdate(
//             req.params.id,
//             { status },
//             { new: true }
//         );

//         if (!batch) {
//             return res.status(404).json({ success: false, message: "Batch code not found" });
//         }

//         res.status(200).json({ success: true, message: "Status updated successfully", batch });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating batch code status", error });
//     }
// });

// Xác nhận trạng thái và cập nhật theo FIFO từ kho tổng
router.post("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const batchCodeId = req.params.id;

        const targetBatch = await BatchCode.findById(batchCodeId);
        if (!targetBatch) return res.status(404).json({ error: true, msg: "Batch code not found" });

        // Nếu không đổi sang delivered thì chỉ update đơn giản
        if (status !== "delivered") {
            targetBatch.status = status;
            await targetBatch.save();
            return res.status(200).json({ error: false, msg: "Status updated" });
        }

        // Đổi sang delivered => thực hiện logic nhập hàng từ kho tổng
        const productId = targetBatch.productId;
        const amountNeeded = targetBatch.amount;

        let amountToFulfill = amountNeeded;

        // Lấy các batch ở kho tổng theo FIFO
        const mainStoreBatches = await BatchCode.find({
            productId,
            locationId: null,
            amountRemain: { $gt: 0 },
        }).sort({ importDate: 1 });

        const deliveredBatches = [];

        for (let sourceBatch of mainStoreBatches) {
            if (amountToFulfill <= 0) break;

            const available = sourceBatch.amountRemain;
            const transferAmount = Math.min(available, amountToFulfill);

            // Trừ số lượng khỏi lô tổng
            sourceBatch.amountRemain -= transferAmount;
            await sourceBatch.save();

            // Tạo batch mới ở kho con
            const newBatch = new BatchCode({
                batchName: `${sourceBatch.batchName}-split`,
                productId: sourceBatch.productId,
                productName: sourceBatch.productName,
                amount: transferAmount,
                amountRemain: transferAmount,
                importDate: sourceBatch.importDate,
                expiredDate: sourceBatch.expiredDate,
                price: sourceBatch.price,
                oldPrice: sourceBatch.oldPrice,
                discount: sourceBatch.discount,
                locationId: targetBatch.locationId,
                locationName: targetBatch.locationName,
                status: "delivered",
                note: `Automation create from ${sourceBatch._id}`
            });
            await newBatch.save();

            deliveredBatches.push(newBatch);
            amountToFulfill -= transferAmount;
        }

        if (amountToFulfill > 0) {
            return res.status(400).json({ error: true, msg: "No enough from main store to import!" });
        }

        // Tăng quantity trong product tại local (nếu cần)
        // const product = await Product.findById(productId);
        // if (product) {
        //     product.quantity = (product.quantity || 0) + amountNeeded;
        //     await product.save();
        // }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        console.log(product);
        console.log(targetBatch.locationId)

        const entry = product.amountAvailable.find(
            item => item.locationId?.toString() === targetBatch.locationId?.toString()
        );
        console.log(entry)
        console.log(amountNeeded)

        if (entry) {
            entry.quantity += amountNeeded;
        } else {
            product.amountAvailable.push({
                locationId: batch.locationId,
                quantity: amountNeeded
            });
        }

        await product.save();

        // Xóa batch yêu cầu gốc vì đã được fulfill bằng các batch mới
        await BatchCode.findByIdAndDelete(batchCodeId);

        return res.status(200).json({
            error: false,
            msg: "Batch delivered and create successfully!",
            deliveredBatches
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, msg: "Server error", details: err.message });
    }
});

router.patch('/updateRemain/:batchId', async (req, res) => {
    try {
      const { batchId } = req.params;
      const { amountRemain } = req.body;
  
      if (amountRemain === undefined) {
        return res.status(400).json({ error: true, msg: "Missing amountRemain in request body" });
      }
      //Thêm vào location
      const batch = await BatchCode.findById(batchId);
      if (!batch) {
        return res.status(404).json({ error: true, msg: "BatchCode not found" });
      }
  
      batch.amountRemain = amountRemain;
      await batch.save();
  
      res.status(200).json({
        error: false,
        msg: "amountRemain updated successfully",
        data: batch,
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Server error", details: error.message });
    }
  });

  // Get total amountRemain of a product in main store (locationId == null)
router.get('/amountRemainTotal/getSum', async (req, res) => {
    try {
        const { productId } = req.query;
        console.log(productId)
        if (!productId) {
            return res.status(400).json({ success: false, message: "Missing productId" });
        }

        const totalRemain = await BatchCode.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                    locationId: null,
                    amountRemain: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amountRemain" }
                }
            }
        ]);

        res.status(200).json({ 
            success: true, 
            total: totalRemain[0]?.total || 0 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

  

module.exports = router;
