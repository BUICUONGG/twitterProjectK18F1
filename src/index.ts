import express from 'express'
import usersRouter from './routes/users.routes'
import dataBaseServer from './services/dataBase.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRoute from './routes/static.routes'
import { MongoClient } from 'mongodb'
import dataBaseService from './services/dataBase.services'

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 4000
initFolder()
dataBaseServer.connect().then(() => {
  dataBaseService.indexUsers()
})

//route mặc định
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/static', staticRoute)

app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server dang mo tren port ${PORT}`)
})

const mgclient = new MongoClient(
  'mongodb+srv://cuongbui10704:cuongbui10704@tweetproject.3yhxuyx.mongodb.net/?retryWrites=true&w=majority'
)

//try cập vào db earth
const db_earth = mgclient.db('earth')
//truy cap65 vào collection users
const users = db_earth.collection('users')

//tạo giả 1000 user
function getRandomAge() {
  return Math.floor(Math.random() * 100) + 1
}

const usersData = []
for (let i = 0; i < 1000; i++) {
  usersData.push({
    name: `user ${i + 1}`,
    age: getRandomAge(),
    sex: i % 2 == 0 ? 'male' : 'female'
  })
}

//nhét mảng vào database
users.insertMany(usersData)
