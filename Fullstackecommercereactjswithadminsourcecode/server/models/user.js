const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        default: "active",
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

    date: {
        type: Date,
        default: Date.now
    },
    totalSpent: {
        type: Number,
        default: 0,
    },

    // 🔹 Thêm role để phân quyền
    role: {
        type: String,
        enum: ["client", "mainAdmin", "storeAdmin", "staff"],
        default: "client",
    },

    // 🔹 Thêm thông tin kho quản lý (chỉ dùng khi là storeAdmin hoặc staff)
    locationManageName: {
        type: String,
        default: null, // Không bắt buộc
    },
    locationManageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreLocation", // Liên kết với StoreLocation
        default: null,
    },
    note: {
        type: String,
        default: null, 
    },
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
