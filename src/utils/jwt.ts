import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayload } from '~/models/requests/Users.request'
config()
export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      resolve(token as string)
    })
  })
}
// hàm kiểm tra token có phải của mình tạo r akhông ? nếu cos thì trả ra payload
export const verifyToken = ({ token, secredOrPublickey }: { token: string; secredOrPublickey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secredOrPublickey, (error, decoded) => {
      if (error) throw reject(error)
      resolve(decoded as TokenPayload)
    })
  })
}
