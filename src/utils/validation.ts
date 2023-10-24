import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    // xử lí errObject
    for (const key in errorObject) {
      // lasy message cua tung cai loi
      const { msg } = errorObject[key]
      //nếu mà msg có dạng là ErrorwithStatus và status !=== 422 thì ném cho default
      // error handler
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      // lưu các lỗi 422 từ errorObject vào entitError
      entityError.errors[key] = msg
    }
    // ở đây nó xử lý lỗi luôn chứ không ném về errorhandler tổng
    next(entityError)
  }
}
