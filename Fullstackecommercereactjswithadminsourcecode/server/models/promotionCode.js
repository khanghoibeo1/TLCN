const mongoose = require('mongoose');
const promotionCodeSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  usedCount: { type: Number, default: 0 },
  maxUsage: { type: Number, required: true },
  reuse: {type: String, enum: ['unlimit','limit'], default: 'limit'},
  type: {type: String, enum: ['product','shipping'], default: 'product'},
  applicableRoles: [{ type: String }],
  applicableCategoryIds: [
    { 
      id: {
        type: String, // hoặc mongoose.Schema.Types.ObjectId nếu liên kết tới Product collection
        default: null,
      },
      name: {
        type: String,
        default: null,
      } 
    }],
  canCombine: { type: Boolean, default: true },
  users: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }
  }],
  status: { type: String, enum: ['active', 'hide'], default: 'active' },
  note: { type: String, default: null },
}, { timestamps: true });

  
promotionCodeSchema.virtual('id').get(function () {
return this._id.toHexString();
});

promotionCodeSchema.set('toJSON', {
virtuals: true,
});

exports.PromotionCode = mongoose.model('PromotionCode', promotionCodeSchema);
exports.promotionCodeSchema = promotionCodeSchema;