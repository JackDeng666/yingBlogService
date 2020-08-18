const Router = require('koa-router')

const Statistics = require('../Controller/Statistics')
const TokenUtil = require('../utils/TokenUtil')

const router = new Router()

router.all('*', async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.body = {
      meta: { status: 0, msg: '统计服务出错了' + error }
    }
  }
})
// 博客点赞收藏相关
router.get('/getPraise', Statistics.getPraise)
router.get('/getPraiseCountByBid', Statistics.getPraiseCountByBid)
router.post('/togglePraise', TokenUtil.checkUserToken, Statistics.togglePraise)

router.get('/getCollect', Statistics.getCollect)
router.get('/getCollectCountByBid', Statistics.getCollectCountByBid)
router.post('/toggleCollect', TokenUtil.checkUserToken, Statistics.toggleCollect)

// 网站统计相关
router.get('/getSiteInfo', Statistics.getSiteInfo)
router.get('/addBrowsedCount', Statistics.addBrowsedCount)
router.get('/addLikedCount', Statistics.addLikedCount)
router.get('/addBlogBrowsedCount', Statistics.addBlogBrowsedCount)

router.post('/updateOwnerInfo', TokenUtil.checkAdminToken, Statistics.updateOwnerInfo)

module.exports = router
