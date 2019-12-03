const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        trim: true
    },
    link: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    _comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    createdAt: {
        type: Date,
        default: Date.now
    },
    votes: {type: Number, default: 0}
}, {timestamps: true})


const Post = new mongoose.model('Post', postSchema)

module.exports = Post