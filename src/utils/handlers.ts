import { NextFunction, RequestHandler, Request, Response } from 'express'

export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    // taoj ra cấu trúc trycatch
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
