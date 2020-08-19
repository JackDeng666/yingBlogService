const fs = require('fs')
const path = require('path')

const UploadUtil = require('../utils/uploadUtil')
const {RESOURCE_URL} = require('../config')

class Resource {
  constructor(){
  }
  async upload(file, fileSizeLimit){
    // 检查文件存在与大小
    if (file != null && file.size < fileSizeLimit) {
      // 以当前日期生成路径文件夹，检查文件夹是否存在如果不存在则新建文件夹
      let dir = UploadUtil.getUploadDirName()
      let pathName = path.join(__dirname, `../static/resource/img/${dir}`)
      UploadUtil.checkDirExistAndCreate(pathName)
      // 通过文件后缀，获取随机的文件名
      let fileName = UploadUtil.getUploadFileName(UploadUtil.getUploadFileExt(file.name))
      // 创建可读流
      const reader = fs.createReadStream(file.path)
      let filePath = `${pathName}/${fileName}`
      // 创建可写流
      const upStream = fs.createWriteStream(filePath)
      // 可读流通过管道写入可写流
      await reader.pipe(upStream)
      return `${RESOURCE_URL}img/${dir}/${fileName}` // 返回图片网络地址
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
        success: 1, 
        message: "上传成功",
        url: imgUrl  
      }
    } else {
      ctx.body = {
        success: 0,
        message: "上传失败，没有传图片，或图片大于3M。"
      }
    }
  }
  async deleteBlogImg(ctx) {
    let blogImgUrl = ctx.request.body.blogImgUrl
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
}

module.exports = new Resource()
