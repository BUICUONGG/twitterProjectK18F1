import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import dataBaseService from './dataBase.services'
import { ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'

class TweetsServices {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = await dataBaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [], //mình sẽ xử lý logic nó sau, nên tạm thời truyền rỗng
        mentions: body.mentions, //dưa mình string[], mình bỏ trực tiếp vào contructor, nó sẽ convert sang ObjectId[] cho mình
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id) //người tạo tweet
      })
    )
    //result: kết quả là obj có 2 thuộc tính {acknowledged: true, insertedId: <id của tweet vừa tạo>
    // lấy id của tweet vừa tạo
    const tweet = await dataBaseService.tweets.findOne({
      _id: result.insertedId
    })
    return tweet
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
