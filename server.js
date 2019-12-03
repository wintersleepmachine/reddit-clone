const express = require('express')
const mongoose = require('mongoose')

const app = express()

require('dotenv').config()

const userRouter =  require('./routes/user')
const postRouter = require('./routes/post')
const commentRouter = require('./routes/comment')

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
// useFindAndModify: false

const db = mongoose.connection

db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())

app.use(commentRouter)
app.use(userRouter)
app.use(postRouter)


app.listen(3000, () => console.log(`Server up on port 3000`))
