import express from 'express'
import { Server } from "socket.io"
import { createServer } from "http"
import database from './utils/db.js'
import Router from './routes/index.js'
import fileUpload from 'express-fileupload'
import JWT from 'jsonwebtoken'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'

process.env.PORT = process.env.PORT || 4444

!async function () {
    const app = express()
    
    // binding socket
    const httpServer = createServer(app)
    const io = new Server(httpServer)
    
    // connect to database
    const { models } = database
    
    // add model to routers
    app.use((req, res, next) => {
        req.models = models
        next()
    })
    
    // middlewares
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(fileUpload())
    app.use(morgan('short', { skip: function (req, res) {return res.statusCode < 400 }, stream: fs.createWriteStream(path.join(process.cwd(), 'src', 'access.log'), { flags: 'a' })}))

    // static
    app.use(express.static('public'))
    
    // routers
    app.use(Router)
    
    // io
    io.on('connection', (socket) => {
        socket.on('started', async({ token }) => {
            try {
                let userId = JWT.verify(token, 'password')._id
                
                const user = await models.User.findOne({ _id: userId })
                
                if (user) {
                    user.is_online = true
                    user.socket_id = socket.id
                    user.save()
                    
                    socket.emit('userInfo', { username: user.username, userImg: user.user_img, user_id: user._id })
                    io.emit('friends')
                    
                } else {
                    socket.emit('error', { error: 'invalid token' })
                }
                
            } catch (error) {
                socket.emit('error', { error: error.message })
            }
        })
        
        socket.on('textSended', async({ userId, friendId, text, time }) => {
            let newMessage = await models.Message.create({
                text,
                message_created_at: time,
                who: userId,
                to_whom: friendId
            })
            
            const friend = await models.User.findOne({ _id: friendId })
            io.to(friend.socket_id).emit('replaceFriends', newMessage)
        })
        
        socket.on('imgSended', async({ userId, friendId, img, time }) => {
            let newMessage = await models.Message.create({
                img,
                message_created_at: time,
                who: userId,
                to_whom: friendId
            })
            
            const friend = await models.User.findOne({ _id: friendId })
            io.to(friend.socket_id).emit('replaceFriends', newMessage)
        })
        
        socket.on('disconnect', async() => {
            const user = await models.User.updateOne({ socket_id: socket.id }, {is_online: false, socket_id: ''})
            
            socket.broadcast.emit('friends')
        })
        
        socket.on('deleteChat', async({ friendId, userId }) => {
            let messages = await models.Message.deleteMany({
                $or: [ {who: userId, to_whom: friendId}, { who: friendId }, { to_whom: userId } ]
            })
            
            const friend = await models.User.findOne( { _id: friendId })
            socket.emit('chatCleared', { friendId })
            io.to(friend.socket_id).emit('chatCleared', { friendId: userId })
            
        })
        
        socket.on('deleteUser', async({ userId }) => {
            let user = await models.User.deleteOne({ _id: userId })
            let messages = await models.Message.deleteMany({
                $or: [{ who: userId }, { to_whom: userId }]
            })
            
            io.emit('userCleared', { userId })
            
        })
    })
    
    // listening
    httpServer.listen(process.env.PORT, () => console.log('http://localhost:' + process.env.PORT))
}()