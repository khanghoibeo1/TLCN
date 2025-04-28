const express = require("express");
const router = express.Router();
const { Notification } = require("../models/notification");
const mongoose = require("mongoose");

// Get all notifications for a specific user
router.get("/", async (req, res) => {
    try {
      const { userId } = req.query;
      console.log(userId)
  
      let notifications;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        notifications = await Notification.find({
          recipients: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } }
        }).sort({ createdAt: -1 });
      } else {
        // Không có userId, lấy tất cả
        notifications = await Notification.find().sort({ createdAt: -1 });
      }
  
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching notifications", error });
    }
  });
  

// Get notification by ID
router.get("/:id", async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching notification", error });
    }
});

// Create a new notification
router.post("/create", async (req, res) => {
    try {
      const { title, message, type, recipients } = req.body;
        console.log(title);
        console.log(message);
        console.log(type)
      if (!title || !message || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      console.log(recipients)
  
      // Convert recipient list to correct format { userId, isRead }
      const formattedRecipients = recipients.map((user) => ({
        userId: user._id , // in case frontend sends _id or userId
        name: user.name,
        isRead: false,
      }));
      console.log(formattedRecipients)
  
      const newNotification = new Notification({
        title,
        message,
        type,
        recipients: formattedRecipients,
      });
  
      const saved = await newNotification.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error creating notification", error });
    }
  });

// Mark a notification as read by user
router.put("/:id/read", async (req, res) => {
    try {
        const {userId} = req.query;
        console.log(userId)
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId" });
        }

        const updated = await Notification.findOneAndUpdate(
            { _id: req.params.id, "recipients.userId": userId },
            { $set: { "recipients.$.isRead": true } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Notification not found or user not a recipient" });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating notification", error });
    }
});

// Delete notification
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting notification", error });
    }
});

module.exports = router;
