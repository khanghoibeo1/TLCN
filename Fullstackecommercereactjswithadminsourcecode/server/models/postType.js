const mongoose = require('mongoose');



const postTypeSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
},{timestamps:true})

postTypeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

postTypeSchema.set('toJSON', {
    virtuals: true,
});

exports.PostType = mongoose.model('PostType', postTypeSchema);
exports.postTypeSchema = postTypeSchema;
