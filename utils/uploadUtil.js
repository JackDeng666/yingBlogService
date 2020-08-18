const path = require('path')
const fs = require('fs')

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
 * @description 根据区间生成随机数
 */
function GetRandomNum(min,max){
  let range = max - min   // 得到随机数区间
  let rand = Math.random() // 得到随机值
  return (min + Math.round(rand * range)) // 最小值+随机数取整
}

/** 
 * @description 输入一个区间,获取一个区间中长度的随机文件名
 */
function GetRadomName(min,max){
  let tempStringArray= "123456789qwertyuiopasdfghjklzxcvbnm".split("") // 构造生成时的字母库数组
  let outPuttext = ""
  // 随机生成文件名的长度，进行循环
  let length = GetRandomNum(min,max)
  for(let i = 1; i < length; i++){
    // 随机抽取字母，拼装成需要的用户名
    outPuttext = outPuttext + tempStringArray[GetRandomNum(0,tempStringArray.length)]
  }
  return outPuttext
}

/** 
 * @description 输入文件后缀,获取随机文件名
 */
function getUploadFileName(ext) {
  let fileName = `${GetRadomName(7,16)}.${ext}`
  return fileName
}

module.exports = {
  checkDirExistAndCreate,
  getUploadDirName,
  getUploadFileExt,
  getUploadFileName
}
