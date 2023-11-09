import { Router } from 'express'
import { serverImageController, serverVideoStreamController } from '~/controllers/medias.controllers'

const staticRoute = Router()

staticRoute.get('/image/:namefile', serverImageController)

staticRoute.get('/video-stream/:namefile', serverVideoStreamController)

export default staticRoute
