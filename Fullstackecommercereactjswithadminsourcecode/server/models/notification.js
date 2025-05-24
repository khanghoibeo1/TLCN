const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["info", "warning", "success", "error", "import", "export"], 
    default: "info" 
  },
  recipients: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: {type: String},
      isRead: { type: Boolean, default: false },
    }
  ],
  applicableRoles: [{ type: String }],
}, { timestamps: true });
notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

notificationSchema.set('toJSON', {
  virtuals: true,
});

exports.Notification = mongoose.model("Notification", notificationSchema);
exports.notificationSchema = notificationSchema;