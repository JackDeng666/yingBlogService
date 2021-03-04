const Router = require('koa-router')

const Resource = require('../Controller/Resource')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*', async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '资源服务出错了' + error }
    }
  }
})

// router.get('/music/:listId/:fileName', Resource.getMusic)
// 需要管理员权限
router.post('/uploadBlogImg', TokenUtil.checkAdminToken,Resource.uploadBlogImg)
router.post('/deleteBlogImg', TokenUtil.checkAdminToken, Resource.deleteBlogImg)
router.post('/uploadMusic', TokenUtil.checkAdminToken, Resource.uploadMusic)
router.post('/deleteMusic', TokenUtil.checkAdminToken, Resource.deleteMusic)
// 需要用户登陆权限
router.post('/uploadUserAvatar', TokenUtil.checkUserToken, Resource.uploadUserAvatar)

module.exports = router
