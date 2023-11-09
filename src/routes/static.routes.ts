import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const staticRoute = Router()

staticRoute.get('./image/:namefile', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))

export default staticRoute
