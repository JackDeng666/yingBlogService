/**
 * @description 根据区间生成随机数
 */
function GetRandomNum(min,max){
  let range = max - min   // 得到随机数区间
  let rand = Math.random() // 得到随机值
  return (min + Math.round(rand * range)) // 最小值+随机数取整
}

/** 
 * @description 输入一个区间和范围值,获取一个区间中长度的随机文件名
 */
function GetRadomName(min,max,include){
  let tempStringArray // 构造生成时的包含的字符数组
  if(include === "NumAndLetter"){
    tempStringArray = "0123456789qwertyuiopasdfghjklzxcvbnm".split("") 
  } else if(include === "Num") {
    tempStringArray = "0123456789".split("") 
  } else if(include === "Letter") {
    tempStringArray = "qwertyuiopasdfghjklzxcvbnm".split("")
  }
  let outPuttext = ""
  // 随机生成文件名的长度，进行循环
  let length = GetRandomNum(min,max)
  for(let i = 1; i < length; i++){
    // 随机抽取字母，拼装成需要的用户名
    outPuttext = outPuttext + tempStringArray[GetRandomNum(0, tempStringArray.length - 1)]
  }
  return outPuttext
}

module.exports = GetRadomName
