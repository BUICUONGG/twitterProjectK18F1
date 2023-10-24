import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import dataBaseService from '~/services/dataBase.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/Users.request'
export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const { user }: any = req
  const user_id = user._id
  // dùng user_id tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  //res access_token và refresh_token cho client
  res.json({
    message: 'login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'register successfully',
    result
  })
}
