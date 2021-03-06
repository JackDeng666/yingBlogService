const fs = require('fs')
const path = require('path')

const UploadUtil = require('../utils/uploadUtil')
const {RESOURCE_URL} = require('../config')

class Resource {
  constructor(){
  }
  async upload(file, fileSizeLimit, listId){
    // 检查文件存在与大小
    if (file != null && file.size < fileSizeLimit) {
      let ext = UploadUtil.getUploadFileExt(file.name)
      if(ext == "mp3" || ext == "m4a"){
        let pathName = path.join(__dirname, `../static/resource/music/${listId}`)
        UploadUtil.checkDirExistAndCreate(pathName)
        // 创建可读流
        let reader = fs.createReadStream(file.path)
        let filePath = `${pathName}/${file.name}`
        // 创建可写流
        let upStream = fs.createWriteStream(filePath)
        // 可读流通过管道写入可写流
        await reader.pipe(upStream)
      } else if(ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png") {
        // 以当前日期生成路径文件夹，检查文件夹是否存在如果不存在则新建文件夹
        let dir = UploadUtil.getUploadDirName()
        let pathName = path.join(__dirname, `../static/resource/img/${dir}`)
        UploadUtil.checkDirExistAndCreate(pathName)
        // 通过文件后缀，获取随机的文件名
        let fileName = UploadUtil.getUploadFileName(ext)
        // 创建可读流
        let reader = fs.createReadStream(file.path)
        let filePath = `${pathName}/${fileName}`
        // 创建可写流
        let upStream = fs.createWriteStream(filePath)
        // 可读流通过管道写入可写流
        await reader.pipe(upStream)
        return `${RESOURCE_URL}img/${dir}/${fileName}` // 返回图片网络地址
      }
    } else {
      return null
    }
  }
  uploadBlogImg = async ctx => {
    let file = ctx.request.files['blogImg']
    // 博客图片限制3M
    let imgUrl = await this.upload(file, 3 * 1024 * 1024)
    if(imgUrl != null){
      ctx.body = {
        meta :{
          status: 1,
          msg: "上传博客图片成功",
        },
        url: imgUrl  
      }
    } else {
      ctx.body = {
        meta: {
          status: 0,
          msg: "上传失败，没有传图片，或图片大于3M。"
        }
      }
    }
  }
  async deleteBlogImg(ctx) {
    let {blogImgUrl} = ctx.request.body
    if(blogImgUrl){
      let ext = blogImgUrl.split('img/')
      fs.unlinkSync(path.join(__dirname, `../static/resource/img/${ext[ext.length - 1]}`), (err) => { })
      ctx.body = {
        meta: { status: 1, msg: '删除博客图片成功' }
      }
    } else {
      ctx.body = {
        meta: { status: 0, msg: '没传图片地址' }
      }
    }
  }
  uploadUserAvatar = async ctx => {
    let oldAvatar = ctx.request.body.avatar
    // 如果有旧头像，把旧的头像删除
    if (oldAvatar) {
      let ext = oldAvatar.split('img/')
      fs.unlink(path.join(__dirname, `../static/resource/img/${ext[ext.length - 1]}`), (err) => {})
    }
    let file = ctx.request.files['avatarImg']
    // 头像限制1M
    let imgUrl = await this.upload(file, 1 * 1024 * 1024)
    if(imgUrl != null){
      ctx.body = {
        meta :{
          status: 1,
          msg: "上传头像成功",
        },
        url: imgUrl  
      }
    } else {
      ctx.body = {
        meta: {
          status: 0,
          msg: "上传失败，没有传图片，或图片大于1M。"
        }
      }
    }
  }
  uploadMusic = async ctx => {
    let musicFile = ctx.request.files.musicFile
    let {listId} = ctx.request.body
    // 传了多个文件
    if(musicFile.length){
      musicFile.forEach(async file => {
        await this.upload(file, 10 * 1024 * 1024, listId)
      })
    } else { // 传了一个
      await this.upload(musicFile, 10 * 1024 * 1024, listId)
    }    
    ctx.body = {
      meta :{
        status: 1,
        msg: "上传音乐成功",
      }
    }
  }
  deleteMusic(ctx){
    let {musicUrl} = ctx.request.body
    if(musicUrl){
      let ext = musicUrl.split('music/')
      fs.unlinkSync(path.join(__dirname, `../static/resource/music/${ext[ext.length - 1]}`), (err) => { })
      ctx.body = {
        meta: { status: 1, msg: '删除音乐成功' }
      }
    } else {
      ctx.body = {
        meta: { status: 0, msg: '没传音乐地址' }
      }
    }
  }
  // getMusic(ctx, next){
  //   let {listId, fileName} = ctx.params
  //   let file = path.resolve(__dirname, `../static/resource/music/${listId}/${fileName}`)
    
  //   let stats = fs.statSync(file)
  //   let range = ctx.headers.range
  //   let total = stats.size

  //   ctx.append("Accept-Ranges", "bytes")
  //   ctx.append("Content-Type", "audio/mp4")
  //   ctx.append("Cache-Control", `max-age=${7 * 86400}`)

  //   if(!range){     
  //     return next()
  //   } else {
  //     let positions = range.replace(/bytes=/, "").split("-")
  //     let start = parseInt(positions[0], 10)
  //     let end = positions[1] ? parseInt(positions[1], 10) : total - 1
  //     let chunksize = (end - start) + 1
      
  //     ctx.status = 206
  //     ctx.append("Content-Range", "bytes " + start + "-" + end + "/" + total)
  //     ctx.append("Content-Length", chunksize)

  //     ctx.body =  fs.createReadStream(file, {start: start, end: end})
  //   }
  // }
}

module.exports = new Resource()
