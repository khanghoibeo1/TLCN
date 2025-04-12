const mongoose = require('mongoose');

// BatchCode Schema
const batchCodeSchema = mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    amountRemain: {
      type: Number,
    },
    importDate: {
      type: Date,
      default: null,
      required: false
    },
    expiredDate: {
      type: Date,
      default: null,
      required: false
    },
    price: {
      type: Number,
      default: 0,
    },
    locationName: {
        type: String,
        default: null, // Không bắt buộc
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreLocation", // Liên kết với StoreLocation
        required: false, // không bắt buộc
        default: null,
    },
    status: {
      type: String,
      enum: ["pending", "delivered"], // Chỉ chấp nhận các giá trị này
      default: "pending", // Mặc định là "pending" (Chờ duyệt)
  },
    note: {
        type: String,
        default: null, 
    },
  },
  { timestamps: true }
);

batchCodeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

batchCodeSchema.set('toJSON', {
  virtuals: true,
});

exports.BatchCode = mongoose.model('BatchCode', batchCodeSchema);
exports.batchCodeSchema = batchCodeSchema;
