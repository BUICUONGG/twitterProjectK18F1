import { NextFunction, RequestHandler, Request, Response } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // taoj ra cấu trúc trycatch
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}