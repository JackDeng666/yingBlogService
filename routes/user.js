const Router = require('koa-router')

const User = require('../Controller/User')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*',async (ctx,next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '用户服务出错了' + error }
    }
  }
})

router.post('/register', User.register)
router.get('/getVerificationCode', User.getVerificationCode)
router.post('/login', User.login)
router.get('/getUserInfo', User.getUserInfo)
router.post('/checkToken', User.checkToken)
router.post('/updateUserInfo', TokenUtil.checkUserToken, User.updateUserInfo)
// 管理员操作
router.post('/adminLogin', User.adminLogin)
router.get('/getUserList', TokenUtil.checkAdminToken, User.getUserList)
router.post('/deleteUser', TokenUtil.checkAdminToken, User.deleteUser)

module.exports = router
