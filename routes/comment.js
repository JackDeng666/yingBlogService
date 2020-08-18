const Router = require('koa-router')

const Comment = require('../Controller/Comment')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*', async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '评论服务出错了' + error }
    }
  }
})

router.get('/getCommentListByBlogId', Comment.getCommentListByBlogId)
router.post('/addComment', TokenUtil.checkUserToken, Comment.addComment)

router.get('/getCommentList', Comment.getCommentList)
router.post('/deleteComment', TokenUtil.checkAdminToken, Comment.deleteComment)

module.exports = router
