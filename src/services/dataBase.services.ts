import { connect } from 'http2'

import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'

import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
config()

const uri = 'mongodb+srv://cuongbui10704:cuongbui10704@tweetproject.3yhxuyx.mongodb.net/?retryWrites=true&w=majority'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri)

const client = new MongoClient(uri)
class DataBaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log(err)
      throw err
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTIO as string)
  }
}

const dataBaseService = new DataBaseService()
export default dataBaseService
