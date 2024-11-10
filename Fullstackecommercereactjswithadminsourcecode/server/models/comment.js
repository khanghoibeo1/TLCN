const mongoose = require('mongoose');
const commentSchema = mongoose.Schema(
    {
      content: {
        type: String,
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
      },
    },
    { timestamps: true }
  );
  
  commentSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });
  
  commentSchema.set('toJSON', {
    virtuals: true,
  });
  
  exports.Comment = mongoose.model('Comment', commentSchema);
  exports.commentSchema = commentSchema;