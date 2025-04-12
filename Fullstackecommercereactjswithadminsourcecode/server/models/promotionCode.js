const mongoose = require('mongoose');
// Promotion Code Schema
// const promotionCodeSchema = mongoose.Schema(
//     {
//       code: {
//         type: String,
//         required: true,
//         unique: true, // Mã khuyến mãi phải duy nhất
//       },
//       description: {
//         type: String, // Mô tả mã khuyến mãi
//       },
//       usedCount: {
//         type: Number,
//         default: 0, // Số lần mã đã được sử dụng
//       },
//       discountPercent: {
//         type: Number,
//         required: true, // Phần trăm giảm giá
//       },
//       maxUsage: {
//         type: Number,
//         required: true, // Số lần sử dụng tối đa của mã
//       },
//       users: [{ // Sửa từ userIds thành users, mảng chứa object với userId và username
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'User', // Liên kết đến model User nếu bạn muốn truy vấn chi tiết người dùng
//           required: true
//         },
//         username: {
//           type: String,
//           required: true
//         }
//       }],
//       status: {
//         type: String,
//         enum: ['active', 'hide'], // Trạng thái có thể là 'active' hoặc 'hide'
//         default: 'active', // Mặc định là 'active'
//       },
//       note: {
//           type: String,
//           default: null, 
//       },
//     },
//     { timestamps: true }
// );
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
  applicableUsers: [
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
  applicableRoles: [{ type: String }],
  applicableProductIds: [
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