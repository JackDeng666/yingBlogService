const jwt = require('jsonwebtoken')
const {keys} = require('../config')
const {secret} = keys // token密钥

class TokenUtil {
  async createUserToken(payload){
    // 用户token7天过期
    let token = await jwt.sign(payload, secret, { expiresIn: 60*60*24*7 })
    return token
  }
  async createAdminToken(){
    // 管理员token1天过期
    let token = await jwt.sign({identity: '管理员'}, secret, { expiresIn: 60*60*24 })
    return token
  }
  async decodeToken(token){
    let decoded = await jwt.decode(token)
    return decoded
  }
  async isValid(token){
    return jwt.verify(token, secret, (err, decoded) => {
      if(err){
        return false
      }
      return true
    })
  }
  // 检查管理员token中间件
  checkAdminToken = async (ctx, next) => {
    let {authorization} = ctx.request.header
    let decoded = await this.decodeToken(authorization)
    if( authorization == undefined || ! await this.isValid(authorization) || decoded.identity !== '管理员' ){
      ctx.body = { 
        meta:{ status: 2, msg: '没有授权，无法访问' }
      }
    } else {
      await next()
    }
  }
  // 检查用户token中间件
  checkUserToken = async (ctx, next) => {
    let {authorization} = ctx.request.header
    if( authorization == undefined || ! await this.isValid(authorization) ){
      return ctx.body = { 
        meta:{ status: 2, msg: '登陆过期' }
      }
    }
    let decoded = await this.decodeToken(authorization)
    console.log(decoded)
    let {userId} = ctx.request.body
    // 当前登陆用户的id和请求过来操作的用户id不一致
    if(userId != null && decoded.userInfo.id != userId ){
      return ctx.body = { 
        meta:{ status: 2, msg: '非法请求，横向越权' }
      }
    }
    await next()
  }
}

module.exports = new TokenUtil()
