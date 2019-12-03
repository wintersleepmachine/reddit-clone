const express = require('express')
const router = new express.Router()

const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')

const auth = require('../middleware/auth')

//Create comment
router.post('/comments', auth, async(req, res) => {
    try{
        const newComment = new Comment({
            comment: req.body.comment,
            _creator: req.user._id,
            _post: req.body._post
        })

        await newComment.save()

        await Post.findByIdAndUpdate(
            req.body._post, 
            {$push: { '_comments': newComment._id}}
            )

        res.status(201).send(newComment)  
    }catch(e){
        res.status(500).send(e.message)
    }
})

//Get a comment
router.get('/comments/:id', async (req, res) => {
    const {id} = req.params
    try {
        const comment = await Comment.findById(id).populate({
            path: '_creator',
            select: 'username'
        })
        
        if(!comment){
            res.status(404).send('comment not found')
        }

        res.send(comment)
    }catch(e){
        res.status(500).send(e.message)
    }
})

//Get all comments by a specific user
router.get('/comments/u/:username', async (req, res) => {
    const {username} = req.params

    try {
        const user = await User.findOne({username})

        const comments = await Comment.find({_creator: user._id}).populate({
            path: '_creator',
            select: 'username',
            
        })

        res.send(comments)
    }catch(e){
        res.status(500).send(e.message)
    }

 
})


//update comment 
router.patch('/comments/:id', auth, async (req, res) => {
    const id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['comment']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        res.status(400).send('Invalid Updates')
    }
    try{
      
        const comment = await Comment.findOne({_id: id, _creator: req.user._id})
        if(!comment){
            res.status(404).send('comment not found')
        }

        updates.forEach(update => {
            comment[update] = req.body[update]
        })

        await comment.save()

        res.send(comment)

    }catch(e){
        res.status(500).send(e.messagae)
    }
})

//Delete Comment
router.delete('/comments/:id', auth, async (req, res) => {
    const id = req.params.id
    try{
        const comment = await Comment.findOne({_id: id, _creator: req.user._id})

        if(!comment){
            res.status(404).send('Post not found')
        }

        await comment.remove()

        res.send('Comment succesfully deleted')

    }catch(e){
        res.status(500).send(e.message)
    }    
})

module.exports = router