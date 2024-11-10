const mongoose = require('mongoose');

// Post Schema
const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    images: [
      {
        type: String,
      }
    ],
    tags: [
      {
        type: String,
      }
    ],
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
