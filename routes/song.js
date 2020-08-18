const Router = require('koa-router')

const TokenUtil = require('../utils/TokenUtil')
const Song = require('../Controller/Song')

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

// 需要管理员权限
router.post('/addSongList', TokenUtil.checkAdminToken, Song.addSongList)
router.post('/deleteSongList', TokenUtil.checkAdminToken, Song.deleteSongList)
router.post('/updateSongList', TokenUtil.checkAdminToken, Song.updateSongList)

router.get('/getSongList', Song.getSongList)

module.exports = router
