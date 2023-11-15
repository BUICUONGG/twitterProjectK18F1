import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'
//định nghĩa người dùng truyền lên cái gì để tạo tweet
export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // k là ObjectId vì
  hashtags: string[] //người dùng truyền lên dạng string,
  mentions: string[] //mình sẽ convert sang ObjectId sau
  medias: Media[]
}
