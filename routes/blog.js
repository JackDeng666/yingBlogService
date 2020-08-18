const Router = require('koa-router')

const Blog = require('../Controller/Blog')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*', async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '博客服务出错了' + error }
    }
  }
})

router.get('/getBlogTypes', Blog.getBlogTypes)
router.get('/getBlogList', Blog.getBlogList)
router.get('/getBlogListByType', Blog.getBlogListByType)
router.get('/getCollectBlogListByUid', Blog.getCollectBlogListByUid)
router.get('/getBlogDetail', Blog.getBlogDetail)
router.post('/addBlogBrowsedCount', Blog.addBlogBrowsedCount)
// 管理员操作
router.post('/addBlogTypes', TokenUtil.checkAdminToken, Blog.addBlogTypes)
router.post('/updateBlogTypes', TokenUtil.checkAdminToken, Blog.updateBlogTypes)
router.post('/deleteBlogTypes', TokenUtil.checkAdminToken, Blog.deleteBlogTypes)
router.post('/addBlog', TokenUtil.checkAdminToken, Blog.addBlog)
router.post('/updateBlogDetail', TokenUtil.checkAdminToken, Blog.updateBlogDetail)
router.post('/deleteBlog', TokenUtil.checkAdminToken, Blog.deleteBlog)

module.exports = router
