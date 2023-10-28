import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
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

export default usersRouter
