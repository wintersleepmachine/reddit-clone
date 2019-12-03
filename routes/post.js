const express = require('express')
const router = new express.Router()
const Post = require('../models/post')
const User = require('../models/user')
const auth = require('../middleware/auth')


//create a post
router.post('/post', auth, async (req, res) => {
    const {title, text} = req.body

    const post = new Post({
        title,
        text,
        _creator: req.user._id
    })

    try{
        await post.save()
        res.status(201).send(post)

    }catch(e){
        res.status(500).send(e.message)
    }
})

//Get a post
router.get('/post/:id', async (req, res) => {
    const id = req.params.id
    try {
        const post = await Post.findById(id).populate({
            path: '_creator',
            select: 'username'
        })
        
        if(!post){
            res.status(404).send('Post not found')
        }

        res.send(post)
    }catch(e){
        res.status(500).send(e.message)
    }
})

//Get all posts from a specific user
router.get('/posts/:username', async (req, res) => {
    const {username} = req.params
    try {
        const user = await User.findOne({username})

        const posts = await Post.find({_creator: user._id}).populate({
            path: '_creator',
            select: 'username',
            
        })
        res.send(posts)
    }catch(e){
        res.status(500).send(e)
    }
})

//update a post
router.patch('/posts/:id', auth, async (req, res) => {
    const id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'text', 'votes']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        res.status(400).send('Invalid Updates')
    }
    try{
      
        const post = await Post.findOne({_id: id, _creator: req.user._id})
        if(!post){
            res.status(404).send('Post not found')
        }

        updates.forEach(update => {
            post[update] = req.body[update]
        })

        await post.save()

        res.send(post)

    }catch(e){
        res.status(500).send(e.messagae)
    }
})


//delete a post
router.delete('/posts/:id', auth, async (req, res) => {
    const id = req.params.id
    try{
        const post = await Post.findOne({_id: id, _creator: req.user._id})

        if(!post){
            res.status(404).send('Post not found')
        }

        await post.remove()

        res.send('Post Succesfully deleted')

    }catch(e){
        res.status(500).send(e.messagae)
    }    
})



module.exports = router
