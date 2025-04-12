const mongoose = require('mongoose');

// Post Schema
const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ytbLink: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      }
    ],
    tags: [
      {
        id: {
          type: String, // hoặc mongoose.Schema.Types.ObjectId nếu liên kết tới Product collection
          default: null,
        },
        name: {
          type: String,
          default: null,
        }
      }
    ],
    
    category: {
      type: String,
      required: true
    },
    catId: {
      type: String,
      default:''
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    note: {
        type: String,
        default: null, 
    },
  },
  { timestamps: true }
);

postSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

postSchema.set('toJSON', {
  virtuals: true,
});

exports.Post = mongoose.model('Post', postSchema);
exports.postSchema = postSchema;