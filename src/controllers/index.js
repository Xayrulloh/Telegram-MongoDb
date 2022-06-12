import path from 'path'
import JWT from 'jsonwebtoken'
import md5 from 'md5'

const reg = async (req, res, next) => {
    try {
        const { username, password } = req.body, { image } = req.files
        
        image.mv(path.join(process.cwd(), 'public', 'images', image.name))

        let newUser = await req.models.User.create({
            username,
            user_password: md5(password),
            user_img: image.name,
            is_online: true,
        })
        
        return res.json({
            status: 200,
            message: 'The user added!',
            token: JWT.sign({_id: newUser._id}, 'password')
        })
        
    } catch (error) {
        if (error.message == 'Validation error') res.json({status: 400, message: 'This username is taken'})
        next(error.message)
    }
}

const log = async (req, res, next) => {
    try {
        const { username, password } = req.body

        const user = await req.models.User.findOne( { username, user_password: md5(password) })

        if (user) {
            user.is_online = true
            user.save()

            return res.json({
                status: 200,
                message: 'The user added!',
                token: JWT.sign({_id: user._id}, 'password')
            })
        } else {
            return res.json({
                status: 400,
                message: 'The user not found'
            })
        }
        
        
    } catch (error) {
        if (error.message == 'Validation error') res.json({status: 400, message: 'This username is taken'})
        next(error.message)
    }
}

const friends = async (req, res, next) => {
    try {
        const { userId, value } = req.body
        
        let users = await req.models.User.find()
        let chateds = []
        
        users = users.filter(el => el._id != userId)

        let messages = await req.models.Message.find({$or: [{who: userId}, {to_whom: userId}]})

        for (let el of messages) {
            if (el.who != userId) {
                chateds.push(users.find(user => JSON.stringify(user._id) == JSON.stringify(el.who) && user.username.toLowerCase().includes(value.toLowerCase())))
            } else chateds.push(users.find(user => JSON.stringify(user._id) == JSON.stringify(el.to_whom) && user.username.toLowerCase().includes(value.toLowerCase())))
        }

        chateds = [...new Set(chateds)]
        
        return res.json({
            status: 200,
            message: 'The user added!',
            friends: chateds
        })
        
    } catch (error) {
        next(error.message)
    }
}

const messages = async (req, res, next) => {
    try {
        const { userId, friendId } = req.body
        let messages = await req.models.Message.find({
            $or: [{ who: userId, to_whom: friendId }, { who: friendId, to_whom: userId }]
        }).sort({createdAt: 1})

        return res.json({
            status: 200,
            messages,
        })

    } catch (error) {
        next(error.message)
    }
}

const upload = async (req, res, next) => {
    try {
        const { image } = req.files
        
        image.mv(path.join(process.cwd(), 'public', 'images', image.name))
        
        return res.json({
            status: 200,
            name: image.name
        })
        
    } catch (error) {
        next(error.message)
    }
}

export default {
    reg,
    log,
    friends,
    messages,
    upload
}