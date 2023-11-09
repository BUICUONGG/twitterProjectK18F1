import { Request, Response } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'
import { Files } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
export const initFolder = () => {
  //nếu không có đường dẫn 'TwitterProject/uploads' thì tạo ra

  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true //cho phép tạo folder nested vào nhau
      //uploads/image/bla bla bla
    }) //mkdirSync: giúp tạo thư mục
  }
}

export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

//hàm xử lí uploadFile mà client gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_TEMP_DIR), //lưu ở đâu
    maxFiles: 4, //tối đa bao nhiêu
    keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg
    maxFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      //   console.log(name, originalFilename, mimetype) //log để xem, nhớ comment
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
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
