import express from 'express'
import usersRouter from './routes/users.routes'
import dataBaseServer from './services/dataBase.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRoute from './routes/static.routes'

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 4000
initFolder()
dataBaseServer.connect()

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
