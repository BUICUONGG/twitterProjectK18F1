import sharp from 'sharp'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import { Request } from 'express'
import { UPLOAD_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
class MediasService {
  async uploadImage(req: Request) {
    //lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    //xử lí file bằng shrap giúo tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        //xóa file trong temp
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
  }
}

const mediasService = new MediasService()

export default mediasService
