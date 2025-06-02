const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    catName:{
        type:String,
        default:''
    },
    catId:{
        type:String,
        default:''
    },
    subCatId:{
        type:String,
        default:''
    },
    subCat:{
        type:String,
        default:''
    },
    subCatName:{
        type:String,
        default:''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    amountAvailable: [
        {
          locationId: {
            type: mongoose.Schema.Types.ObjectId,  // hoặc mongoose.Schema.Types.ObjectId nếu bạn có collection kho riêng
            ref: 'Location',
            required: true,
          },
          iso2: {
            type: String,  // hoặc mongoose.Schema.Types.ObjectId nếu bạn có collection kho riêng
            required: true,
            default: "no",
          },
          quantity: {
            type: Number,
            required: true,
            default: 0,
          }
        }
      ],
    rating: {
        type: Number,
        default: 5,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },

    location: [
    {
      value: {
        type: String,
      },
      label: {
        type: String,
      }
    },
  ],
  // 🔹 Thêm role để phân quyền
  season: [
      {
        type: String,
        enum: ["Spring", "Summer", "Fall", "Winter"],
      }
  ],
  note: {
      type: String,
      default: null, 
  },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})


productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
