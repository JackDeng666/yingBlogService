const path = require('path')
const fs = require('fs')

const GetRadomName = require('./randomName')

/**
 * @description 批量判断文件夹是否存在 如果不存在则创建文件夹
 */
function checkDirExistAndCreate(filepath) {
  if(!fs.existsSync(path.dirname(filepath))){
    checkDirExistAndCreate(path.dirname(filepath))
  }
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath)
  }
}

/**
 * @descriptio 根据当前日期产生文件夹目录
 */
function getUploadDirName(){
  let date = new Date()
  let month = Number.parseInt(date.getMonth()) + 1
  month = month.toString()
  let dir = `${date.getFullYear()}/${month}/${date.getDate()}`
  return dir
}

/**
 * @param {文件名} name 
 * @description 获取文件名后缀
 */
function getUploadFileExt(name) {
  let ext = name.split('.')
  return ext[ext.length - 1]
}
/** 
 * @description 输入文件后缀,获取随机文件名
 */
function getUploadFileName(ext) {
  let fileName = `${GetRadomName(7,16,"NumAndLetter")}.${ext}`
  return fileName
}

//删除目录下的所有文件
function delFile(fileUrl){
  if (!fs.existsSync(fileUrl)) return
  // 当前文件为文件夹时
  if (fs.statSync(fileUrl).isDirectory()) {
    // 读取下面的文件
    let files = fs.readdirSync(fileUrl)
    let len = files.length
    // 把下面的文件删了
    for(let i = 0; i < len; i++){
      let url = fileUrl + '/' + files[i]
      delFile(url)
    }
    // 递归出来后把自己删了
    fs.rmdirSync(fileUrl)
  } else { // 当前文件为文件时
    fs.unlinkSync(fileUrl)
  }
}

module.exports = {
  checkDirExistAndCreate,
  getUploadDirName,
  getUploadFileExt,
  getUploadFileName,
  delFile
}
