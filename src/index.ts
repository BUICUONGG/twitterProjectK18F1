import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import dataBaseServer from './services/dataBase.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
app.use(express.json())
const PORT = 3000
dataBaseServer.connect()

//route mặc định
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server dang mo tren port ${PORT}`)
})
