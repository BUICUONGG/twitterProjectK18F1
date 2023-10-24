import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
/*
des: dang nhap
path: /user/ login
method: POST
body: {email, password}
 */
usersRouter.get('/login', loginValidator, loginController)

/*
des: register new user
path: /register
method: lost
*/
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

export default usersRouter
