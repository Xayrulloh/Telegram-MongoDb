import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    who: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to_whom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String,
    img: String
}, {timestamps: true})

export default mongoose.model('Message', MessageSchema)
