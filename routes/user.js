const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')


//signing up a user
router.post('/sign-up', async (req, res) => {
    const user = new User(req.body)

    try {
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    }catch(e){
        res.status(500).send(e.message)
    }
})

//Login user
router.post('/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()

        res.status(200).send({user, token})
    }catch(e){
        res.status(500).send(e.message)
    }    
})

//Logout a user from a specific device
router.post('/logout', auth, async (req, res) => {
try{
    req.user.tokens = req.user.tokens.filter(token => {
        return token.token !== req.token
    })

    await req.user.save()

    res.status(200).send('Succesfully logged out')
    }catch(e){
    res.status(500).send(e.message)
    }
})

//Logout all devices
router.post('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [] //Deleting all the tokens from the users array
        await req.user.save()

        res.status(200).send({message: 'Sucessfully logged out of all devices'})
    }catch(e){
        res.status(500).send(e)
    }
})





//
//
//
//



//Getting a user
router.get('/u/:username', async (req, res) => {
    const username = req.params.username
    try {
        const user = await User.findOne({username})
        if(!user){
            res.status(404).send('No user was found with that username')
        }
        res.status(200).send(user)
    }catch(e){
        res.status(500).send(e)
    }
})

// router.get('/u/me', auth, async (req, res) => {
//     try {
//         res.status(200).send(req.user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })




//Updating a user
router.patch('/u/:username', async(req, res) => {
    const username = req.params.username

    try{
        const user =  await User.findOne({username})

        if(!user){
            res.status(404).send('the user was not found with that ID')
        }

        const updates = Object.keys(req.body)
        const allowedUpdates = ['username', 'email', 'password']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if(!isValidOperation){
            res.status(400).send('Invalid updates')
        }

        updates.forEach(update => {
            user[update] = req.body[update]
        })

        await user.save()
        res.send(user)

    }catch(e){
        res.status(500).send(e.message)
    }
})

//Deleting a user
router.delete('/u/:username', async (req, res) => {
    const username = req.params.username
     try {
        const deletedUser = await User.findOneAndDelete({username})
        if(!deletedUser){
            res.status(400).send('User is not found with that username')
        }

        res.send(deletedUser)

     }catch(e){
        res.status(500).send(e.message)
     }

})





module.exports = router