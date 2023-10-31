import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import dataBaseService from '~/services/dataBase.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/Users.request'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const user = req.user as User
  const user_id = user._id as ObjectId
  // dùng user_id tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  //res access_token và refresh_token cho client
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // laya refresh_token tu body
  const refresh_token = req.body.refresh_token
  // goi ham` logout, ham` nhan vao` refresh_token tim va xoa
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (req: Request, res: Response) => {
  //nếu mà code vào đuọce đây nghĩa là email_verify_token hợp lệ
  // và mình lấy đuọce decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  //dựa vào uer_id tìm user và xem thử nó đã verify chưa?
  const user = await dataBaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // nếu mà xuốn fđuọce đâu có nghĩa là user đó chưa verify
  // mihf sẽ update lại user đó
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}
