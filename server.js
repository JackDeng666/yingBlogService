const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
// https证书，导入生成的证书文件
const privateKey  = fs.readFileSync(path.join(__dirname, './certificate/3_anotherbug.cn.key'), 'utf8')
const certificate = 
  fs.readFileSync(path.join(__dirname, './certificate/2_anotherbug.cn.crt'), 'utf8')
  + '\n' +
  fs.readFileSync(path.join(__dirname, './certificate/1_root_bundle.crt'), 'utf8')
const credentials = {key: privateKey, cert: certificate}
// 不用https以上全部注释

const Koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
const cors = require('koa2-cors')
const static = require("koa-static")

// 获取数据库连接池
const db = require('./utils/database')
const statisticsCacheUtil = require('./utils/statisticsCacheUtil')
statisticsCacheUtil.init(db)
// 路由
const user = require('./routes/user')
const blog = require('./routes/blog')
const statistics = require('./routes/statistics')
const message = require('./routes/message')
const comment = require('./routes/comment')
const resource = require('./routes/resource')
const song = require('./routes/song')

const app = new Koa()
const router = new Router()

router.use('/user', user.routes())
router.use('/blog', blog.routes())
router.use('/statistics', statistics.routes())
router.use('/message', message.routes())
router.use('/comment', comment.routes())
router.use('/resource', resource.routes())
router.use('/song', song.routes())

// 把数据库co-mysql对象和统计相关的缓存操作对象挂在到上下文
app.context.db = db
app.context.statisticsCacheUtil = statisticsCacheUtil
app.use(cors())
app.use(koaBody({
  multipart: true
}))
app.use(router.routes())
//处理静态资源，maxage为缓存时间，单位为毫秒
app.use(static(path.resolve('./static'),{ maxage: 7 * 86400 * 1000 }))
// 捕获读音视频流错误
// app.on('error', (error) => {
//   if (error.code === 'EPIPE') {
//     console.log('Koa app-level EPIPE error：' + error )
//   } else {
//     console.log('Koa app-level error：' + error)
//   }
// })

// 直接启动
// app.listen(80,() => {
//   console.log('http://localhost:80')
// })

// 创建https服务器,不用https可注释以下，再把上面的打开
const httpsServer = https.createServer(credentials, app.callback())
httpsServer.listen(443, function() {
  console.log('HTTPS Server is running on: https://localhost/')
})
// 创建http服务，重定向到https
http.createServer((req,res)=>{
  res.writeHead(301, {'Location': 'https://localhost:443/'})
  res.end()
}).listen(80)
