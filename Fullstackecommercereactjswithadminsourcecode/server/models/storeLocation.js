const mongoose = require('mongoose');

const storeLocationSchema = mongoose.Schema(
    {
        iso2: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        detailAddress: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

// Tạo virtual field 'id' từ _id
storeLocationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Chuyển đổi khi JSON hóa
storeLocationSchema.set('toJSON', {
    virtuals: true,
});

const StoreLocation = mongoose.model('StoreLocation', storeLocationSchema);

module.exports = { StoreLocation, storeLocationSchema };
