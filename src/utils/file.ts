import { Request, Response } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'
import { Files } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}

//hàm xử lí uploadFile mà client gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu ở đâu
    maxFiles: 4, //tối đa bao nhiêu
    keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg
    maxFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      //   console.log(name, originalFilename, mimetype) //log để xem, nhớ comment
      const valid: any = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      } //để ý dòng này
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      resolve(files.image as File[])
    })
  })
}
// vào body nhận vào request và xử lí video xem có hóa yêu cầu không và lưu vào video/temp
export const handleUploadVideo = async (req: Request) => {
  //caauf hình mình sẽ nhận vào video như thế nào : formidable
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFieldsSize: 50 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = 'video' && Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      } //để ý dòng này
      if (!files.video) {
        return reject(new Error('Video is empty'))
      }
      //danh sách các video đã upload
      const videos = files.video as File[]
      //gán đuôi cũ vào cho nó
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        //filepath là đường dẫn mới của video nhưng ko có đuôi vì mình kfhông dùng keepExtend
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        //newFilename laf tên mới của video nhưng ko có đuôi
        video.newFilename = video.newFilename + '.' + ext
      })
      return resolve(files.video as File[])
    })
  })
}
