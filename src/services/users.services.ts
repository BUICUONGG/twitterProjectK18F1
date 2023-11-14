import User from '~/models/schemas/User.schema'
import dataBaseService from './dataBase.services'
import { RegisterReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Followers.schema'
import axios from 'axios'
import { header } from 'express-validator'
config()

class UsersService {
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secredOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefeshToken, verify, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    } else {
      return signToken({
        payload: { user_id, token_type: TokenType.RefeshToken, verify },
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
  }
  //ký access_tokoen và refresh_token
  async signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  // hàm sign email_verify_token
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifycationTOken, verify },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifycationTOken, verify },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPTRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified // 0
    })
    const result = await dataBaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    //từ user_id tạo ra 1 access token và 1 refresh_token
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    //decode refresh_token de lay exp iat
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    // luuw accesstoKen và refresh_token vào database
    await dataBaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), exp, iat })
    )
    //aws ses: Giúp gửi mail về mail
    //Giờ  chưa có aws nên phải *Giả lập gửi mail
    console.log(email_verify_token)

    return { access_token, refresh_token }
  }
  async checkEmailExist(email: string) {
    // vao` databse tìm user có email này
    const user = await dataBaseService.users.findOne({ email })
    return Boolean(user)
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    //lưu refresh và access Token vaof database
    await dataBaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), exp, iat })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    // dung` refresh_token tim va xoa
    await dataBaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async verifyEmail(user_id: string) {
    //update lai user
    await dataBaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          verify: UserVerifyStatus.Verified,
          email_verify_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    // taoj ra access vaf refresh token
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    // luu refresh_token vao db
    await dataBaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), exp, iat })
    )
    return { access_token, refresh_token }
  }

  async resendEmailVerify(user_id: string) {
    // tạo ra access_token và refréh_token
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    // lưu refresh_token vào email
    await dataBaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS } // resend email verify success
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // tao ra forgot_password_token
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    // update lai user
    await dataBaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    // gia lap
    console.log(forgot_password_token)
    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
    // check email to reset password
  }

  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    //dùng cái user_id đó tìm user và update password
    await dataBaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await dataBaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: any) {
    //dùng user_id tìm user và update lại password
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    // tiến hành update
    const user = await dataBaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ...payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after', // trả về document sau khi update
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user.value
  }

  async getProfile(username: string) {
    const user = await dataBaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          update_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  async follow(user_id: string, followed_user_id: string) {
    //kiểm tra xem đã có follow hay chưa
    const isFollowed = await dataBaseService.users.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (isFollowed == null) {
      return {
        message: USERS_MESSAGES.FOLLOWED
      }
    }
    // chưa follow thì thêm 1 document và collection followers
    await dataBaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESS
    }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    // kiểm tra xem mình đã follow chưa
    const isFollowed = await dataBaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (!isFollowed) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await dataBaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(user_id: string, password: string) {
    await dataBaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    // tao ra access và refresh token mới
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({
        user_id: user_id,
        verify,
        exp
      })
    ])
    await dataBaseService.refreshToken.deleteOne({ token: refresh_token })
    const { iat } = await this.decodeRefreshToken(new_refresh_token)
    await dataBaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: new_refresh_token, exp, iat })
    )
    return { access_token, refresh_token: new_refresh_token }
  }

  // getoAuthGoogleToken dùng code nhận đucợ jđể yêu cầu gg tạo id token
  private async getoAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      client_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      email_verified: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oAuth(code: string) {
    const { access_token, id_token } = await this.getoAuthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    //kiểm tra xem user đã verify chưa
    if (!userInfo.email_verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    //kiểm tra xem email đó có tồntại trong db của mình chưa
    const user = await dataBaseService.users.findOne({ email: userInfo.email })
    //nếu có nghĩ là cliênt đăng nhập
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { exp, iat } = await this.decodeRefreshToken(refresh_token)
      // Luw lại refresh_token vào db
      await dataBaseService.refreshToken.insertOne(
        new RefreshToken({ user_id: new ObjectId(user._id), token: refresh_token, exp, iat })
      )
      return {
        access_token,
        refresh_token,
        new_user: 0,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).slice(1, 15)
      const data = await this.register({
        email: userInfo.email,
        password,
        confirm_password: password,
        name: userInfo.name,
        date_of_birth: new Date().toISOString()
      })
      return {
        ...data,
        new_user: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
}

const usersService = new UsersService()
export default usersService
