const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
        },

        image: {
            type: String,
        },
        senderRole: {
            type: String,
            enum: ['client', 'mainAdmin','bot'],
            required: true,
        },
        isRead: { type: Boolean, default: false },
    },
    {timestamps: true}
);

messageSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

messageSchema.set('toJSON', {
    virtuals: true,
});

exports.Messages = mongoose.model('Messages', messageSchema);
exports.messageSchema = messageSchema;
