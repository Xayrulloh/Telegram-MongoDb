import mongoose from 'mongoose'

connect()

import models from '#models/index'

export default {
    models
}

async function connect() {
    await mongoose.connect('mongodb://localhost/Telegram')
}