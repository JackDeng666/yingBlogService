// 密码加盐
const crypto = require('crypto')
const { keys } = require('../config')
const {salt1, salt2} = keys

module.exports = pass => {
  let sha1 = crypto.createHash('sha1')
  let ciphertext = sha1.update(salt1 + pass + salt2).digest('hex')
  return ciphertext
}
