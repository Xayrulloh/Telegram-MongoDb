import { Router } from 'express'
import path from 'path'

import CT from '#controllers/index'

const router = Router()

// register
router.get('/register', (req, res) => {res.sendFile(path.join(process.cwd(), 'public', 'html', 'register.html'))})
router.post('/register', CT.reg)

// // login
router.get('/login', (req, res) => {res.sendFile(path.join(process.cwd(), 'public', 'html', 'login.html'))})
router.post('/login', CT.log)

// // home
router.get('/', (req, res) => {res.sendFile(path.join(process.cwd(), 'public', 'html', 'main.html'))})

// // users and messages
router.get('/users', async(req, res) => {res.json(await req.models.User.find())})
router.post('/userFriends', CT.friends)
router.post('/friendMessage', CT.messages)
router.post('/upload', CT.upload)

export default router