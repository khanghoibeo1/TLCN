const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    shippingMethod: {
        type: String,
        required: true,
    },
    shippingFee:{
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    payment: {
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'Paypal','VNPAY']
    },
    email: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    },
    products: [
        {
            productId:{
                type:String
            },
            productTitle: {
                type: String
            },
            batchId: {
                type: String
            },
            quantity:{
                type:Number
            },
            price:{
                type:Number
            },
            image:{
                type:String
            },
            subTotal:{
                type:Number
            }
        }
    ],
    status:{
        type:String,
        enum: ["pending", "delivered", "cancelled", "verified"],
        default:"pending"
    },
    paymentStatus:{
        type:String,
        enum: ["unpaid", "paid"],
        default:"unpaid"
    },
    orderDiscount: {
        type: Number,
        default: 0 // Phần trăm giảm giá
    },
    note: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    locationName: {
        type: String,
        default: null,
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreLocation",
        required: false,
        default: null,
    },

}, { timestamps: true })

ordersSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ordersSchema.set('toJSON', {
    virtuals: true,
});

exports.Orders = mongoose.model('Orders', ordersSchema);
exports.ordersSchema = ordersSchema;
