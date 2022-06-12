import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    socket_id: String,
    username: {
        type: String,
        required: true,
    },
    user_password: {
        type: String,
        required: true,
    },
    user_img: {
        type: String,
        required: true,
    },
    is_online: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

export default mongoose.model('User', UserSchema)
