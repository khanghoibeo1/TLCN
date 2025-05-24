const mongoose = require("mongoose");

const userAddressSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addresses: [
    {
      email: {
        type: String,
        required: false,
        default: null,
      },
      phoneNumber: {
        type: String,
        required: false,
        default: null,
      },
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

userAddressSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userAddressSchema.set("toJSON", {
  virtuals: true,
});

exports.UserAddress = mongoose.model("UserAddress", userAddressSchema);
exports.userAddressSchema = userAddressSchema;
