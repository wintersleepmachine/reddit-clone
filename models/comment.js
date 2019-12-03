const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    _post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    votes: {type: Number, default: 0}
}, {timestamps: true})


commentSchema.methods.toJSON = function(){ 
const comment = this
const commentObj = comment.toObject()

delete commentObj.isDeleted


return commentObj
}

const Comment = new mongoose.model('Comment', commentSchema)

module.exports = Comment