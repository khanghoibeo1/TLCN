const mongoose = require('mongoose');

const recommendationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Mỗi user chỉ có 1 danh sách gợi ý
    },
    recommendedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    ],
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

recommendationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

recommendationSchema.set('toJSON', {
    virtuals: true,
});

exports.Recommendation = mongoose.model('Recommendation', recommendationSchema);
exports.recommendationSchema = recommendationSchema;
