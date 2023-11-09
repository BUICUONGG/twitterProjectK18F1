import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'
import { handleUploadImage } from '~/utils/file'
import mediasService from '~/services/medias.services'
import { USERS_MESSAGES } from '~/constants/messages'
import { UPLOAD_DIR } from '~/constants/dir'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadImage(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const uploadImageController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  res.sendFile(path.resolve(UPLOAD_DIR, namefile), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found image')
    }
  })
}
