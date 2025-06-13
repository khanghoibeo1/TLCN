const mongoose = require('mongoose');

const recentViewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // Mỗi user chỉ có 1 document
    },
    viewedProducts: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

recentViewSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

recentViewSchema.set('toJSON', {
    virtuals: true,
});

exports.RecentView = mongoose.model('RecentView', recentViewSchema);
exports.recentViewSchema = recentViewSchema;
