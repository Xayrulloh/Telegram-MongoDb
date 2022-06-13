import mongoose from 'mongoose'

connect()

import models from '#models/index'

async function connect() {
    await mongoose.connect('mongodb://localhost:27017/Telegram')
}

export default {
    models
}