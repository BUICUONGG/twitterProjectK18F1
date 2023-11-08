import { Router } from 'express'
import {
  emailVerifyTokenController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/Users.request'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
/*
des: dang nhap
path: /user/ login
method: POST
body: {email, password}
 */
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

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

/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))
// chưa có controller getProfileController , nên bây giờ ta làm

/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>}
body: {followed_user_id: string}
*/
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))

//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers
/*
  654b3526070f9937528b410b: user 40
  654b3676070f9937528b4110: user 44
*/

/*
    des: unfollow someone
    path: '/follow/:user_id'
    method: delete
    headers: {Authorization: Bearer <access_token>}
*/
usersRouter.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)
export default usersRouter
