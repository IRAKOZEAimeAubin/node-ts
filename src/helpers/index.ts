import crypto from 'crypto'

const SECRET = 'adx4KDcftEJm1PlUHNaHHZn6NlmaWitN8DD9NV1vLoo='

export const random = () => crypto.randomBytes(128).toString('base64')
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac('sha256', [salt, password].join('/'))
    .update(SECRET)
    .digest('hex')
}
