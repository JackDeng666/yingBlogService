const Router = require('koa-router')

const Message = require('../Controller/Message')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*', async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '消息服务出错了' + error }
    }
  }
})

router.get('/getMessageList', Message.getMessageList)
router.post('/addMessage', TokenUtil.checkUserToken, Message.addMessage)
// 管理员操作
router.post('/deleteMessage', TokenUtil.checkAdminToken, Message.deleteMessage)

module.exports = router
