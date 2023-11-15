import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/Users.request'
import tweetsServices from '~/services/tweets.services'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  //muốn đăng bài thì cần user_id: biet ai la nguoi dang, body: noi dung tweet
  const body = req.body as TweetRequestBody
  const { user_id } = req.decoded_authorization as TokenPayload
  // goi ham` luu vao database
  const result = await tweetsServices.createTweet(user_id, body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}
