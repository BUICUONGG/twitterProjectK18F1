import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
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
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
des: resend email verify token
khi mail thất lạc or email verify token hết hạn thì người dùng có nhu câì resend 
lại email_verify_token

method: POST
path: /users/resend-email-verify-token
header: {Authorization: "Bearer <access_token>"} // đăng nhập mới dudọcw resend 
body
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mk thì họ gửii email để xin mình tạo cho họ forgot_password_token
path: /users/forgot-password
method: POST
body{email: string}
*/

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
  des: khi ngdùng nhâpf vào link trong email để reset password
  họ sẽ gửi 1 req kèm theo forgot_password_token lên server
  server sẽ kiểm tra forgot_password_token cod hợp lệ ko 
  
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)
export default usersRouter
