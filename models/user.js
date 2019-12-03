const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            for(let char of value){
                if(char === ' '){
                    throw new Error('Username must not contain any spaces')
                }
            }
        }
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password must not contain the word "password"')
            }
        }
    },
    karma: {
        type: Number,
        default: 0
    },
    joined: {
        type: Date,
        default: Date.now
    },
    posts: [
        {type:mongoose.Schema.Types.ObjectId}
    ],
    comments: [
        {type:mongoose.Schema.Types.ObjectId}
    ],
    tokens: [{
        token:{
            type:String,
            required: true
        }
    }]
}, {timestamps: true})

userSchema.statics.findByCredentials = async (username, password) => {

    try {
        const user = await User.findOne({username})

        if(!user){
        
        return res.status(404).send('Invalid credentials')
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(403).send('Invalid credentials')
        }

        return user
    }catch(e){
        res.status(500).send(e)
    }
 
}

userSchema.methods.generateAuthToken = async function(){
    let user = this

    try {

        const token = jwt.sign({_id: user._id}, process.env.SECRET_ACCESS_KEY)
        user.tokens.push({token})
        await user.save()

        return token
    }catch(e){
        res.status(500).send(e.message)
    }

    
}

userSchema.pre('save', async function(req, res, next){
    let user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()

})

userSchema.methods.toJSON = function(){ //Whenever res.send() is called, mongoose calls toJSON behind the scenes. Here we can modify the object before it 
                                            //is converted to JSON.
const user = this
const userObj = user.toObject()

delete userObj.password
delete userObj.tokens
delete userObj._id

return userObj
}

const User = new mongoose.model('User', userSchema)

module.exports = User