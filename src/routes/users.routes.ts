import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVeriffyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
/*
des: dang nhap
path: /user/ login
method: POST
body: {email, password}
 */
usersRouter.get('/login', loginValidator, wrapAsync(loginController))

/*
des: register new user
path: /register
method: lost
*/
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
  des: lougout(dang xuat)
  path: /users/logout
  method: POST
  Header: {Authorization: 'Bearer <access_token>'}
  body: {refresh_token: string}
  */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController)) //ta sẽ thêm middleware sau

/*
des: verify email token
khi người dùng đki thì họ sẽ đucợ mail có link dạng
http:localhost3000?user/verify-email?token=<email_verify_token>
nếu mà em nhấp vào link thì sẽ tọa ra req gửi lên email_verify_token lên server
server kiểm tra email_verify_token có hợp lệ ko ?
từ decođe_email_verify_token lấy ra user_id
và vào user_id đó để update email_verify_token thành '', verify = 1, update_at

path: /users/verify-email
method: POST
body: {email_verify_token: string}
 */
usersRouter.post('/verify-email', emailVeriffyTokenValidator, wrapAsync(emailVerifyTokenController))
export default usersRouter
