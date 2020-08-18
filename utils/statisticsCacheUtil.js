// 网站统计工具
const siteInfo = {
  mainInfo: null,
  recentDaysStatistics: null,
  ownerInfo: null
}
const oneDayMs = 86400000 // 一天毫秒数
const updateTime = 3600 * 1000 // 间隔检查更新时间1个小时
const recentDays = 30 // 最近天数
let tempSiteInfo
let db
/**
 * 初始化数据
 * @param {数据库连接池对象} dbObject 
 */
async function init(dbObject){
  db = dbObject
  let res = await db.query("select * from site_info")
  let mainInfoStr = res[0].data
  let recentDaysStatisticsStr = res[1].data
  let ownerInfoStr = res[2].data
  if(mainInfoStr == '{}'){
    siteInfo.mainInfo = mainInfoInit()
  } else {
    siteInfo.mainInfo = JSON.parse(mainInfoStr)
  }
  if(recentDaysStatisticsStr == '{}'){
    siteInfo.recentDaysStatistics = recentDaysStatisticsInit()
  } else {
    siteInfo.recentDaysStatistics = JSON.parse(recentDaysStatisticsStr)
  }
  if(ownerInfoStr == '{}'){
    siteInfo.ownerInfo = ownerInfoInit()
  } else {
    siteInfo.ownerInfo = JSON.parse(ownerInfoStr)
  }
  tempSiteInfo = JSON.stringify(siteInfo)
}
// 主信息初始化
function mainInfoInit(){
  let mainInfoJson = {
    allBrowsedCount: 0,  // 所有进站数
    allLikedCount: 0, // 所有点赞数
    allBlogBrowsedCount: 0,  // 所有博客点击数
    notice: "启动成功"  // 公告
  }
  return mainInfoJson
}
// 7天统计初始化
function recentDaysStatisticsInit(){
  let dateArr = getRecentDays()
  dateArr.reverse()
  let recentDaysStatisticsArr = []
  for(let i = 0; i < dateArr.length; i++){
    recentDaysStatisticsArr.push({
      date: dateArr[i], // 日期
      dayBrowsedCount: 0,  // 今日进站数
      dayLikedCount: 0, // 今日点赞数
      dayBlogBrowsedCount: 0 // 今日博客点击数
    })
  }
  return recentDaysStatisticsArr
}
// 站主信息初始化
function ownerInfoInit(){
  let ownerInfoJson = {
    ownerBasicInfo: {
      name: "邓恩泽",  
      sex: "男", 
      age: "21",  
      profession: "学生",
      hobby: "漫画 动画 电影 音乐 敲bug",
      email: "jackdeng155@qq.com",
      phoneNumber: "13046263256",
      address: "广东省广州市广东青年职业学院"
    },
    ownerSkillInfo: [ // 技能掌握信息
      {
        category: '前端技术',
        skillInfo: [
          { skillName: 'HTML+CSS', skillProgress: 80 },
          { skillName: 'javascript', skillProgress: 72 },
          { skillName: 'Jquery', skillProgress: 40 },
          { skillName: 'Vue', skillProgress: 66 },
          { skillName: '微信小程序', skillProgress: 20 },
          { skillName: 'Java安卓App', skillProgress: 55 }
        ]
      },
      {
        category: '后端技术',
        skillInfo: [
          { skillName: 'Java基础', skillProgress: 55 },
          { skillName: 'MySQL', skillProgress: 42 },
          { skillName: 'Spring框架', skillProgress: 20 },
          { skillName: 'SpringBoot', skillProgress: 30 },
          { skillName: 'Node.js', skillProgress: 38 },
          { skillName: 'Koa框架', skillProgress: 56 }
        ]
      },
      {
        category: '平面技术',
        skillInfo: [
          { skillName: 'Photoshop', skillProgress: 30 },
          { skillName: 'Audition', skillProgress: 2 },
          { skillName: 'Illustrator', skillProgress: 15 },
          { skillName: 'Premiere', skillProgress: 12 },
          { skillName: 'AfterEffects', skillProgress: 6 }
        ]
      }
    ]
  }
  return ownerInfoJson
}
/**
 * 获取最近七天日期
 */
function getRecentDays(){
  let date = new Date()
  date = new Date(date.toLocaleDateString())
  let dateArr = []
  tempDate = date
  for(let i = 0; i < recentDays; i++){
    dateArr.push(tempDate)
    let yesDay = tempDate.valueOf() - oneDayMs
    let yesDate = new Date(yesDay)
    tempDate = yesDate
  }
  // 转换为字符
  let dateStrArr = []
  for(let i = 0; i < dateArr.length; i++){
    dateStrArr.push(dateArr[i].toLocaleDateString())
  }
  return dateStrArr
}
/**
 * 判断今天是否比数组最后一个日期新，替换数组内容
 */
function isNewDay(){
  let today = new Date(new Date().toLocaleDateString())
  let arrNewestDay = new Date(siteInfo.recentDaysStatistics[recentDays - 1].date) // 当前缓存中最新的一天
  let diff = today.getTime() - arrNewestDay.getTime()
  if(diff != 0){
    let diffDays = Math.ceil(diff / oneDayMs) // 求出差距n天
    if(diffDays > recentDays){ // 差距大于规定天数，直接新建
      siteInfo.recentDaysStatistics = recentDaysStatisticsInit()
    } else {
      // 添加n天，同时删除前n天
      for(let i = 0; i < diffDays; i++){
        let addDate = new Date(
          new Date(
            siteInfo.recentDaysStatistics[recentDays - 1].date
          ).getTime() 
          + oneDayMs)
        siteInfo.recentDaysStatistics.push({
          date: addDate.toLocaleDateString(), // 日期
          dayBrowsedCount: 0,  // 今日进站数
          dayLikedCount: 0, // 今日点赞数
          dayBlogBrowsedCount: 0 // 今日博客点击数
        })
        siteInfo.recentDaysStatistics.shift() // 弹出一天
      }
    }
  }
}
// 定时把缓存的数据存入数据库
async function timingAddData(){
  let currentSiteInfo = JSON.stringify(siteInfo)
  // 数据更新了再存
  if(tempSiteInfo != currentSiteInfo){
    let mainInfoStr = JSON.stringify(siteInfo.mainInfo)
    let recentDaysStatisticsStr = JSON.stringify(siteInfo.recentDaysStatistics)
    let ownerInfoStr = JSON.stringify(siteInfo.ownerInfo)
    await db.query(`
      update site_info
        set data = ?
      where
      type = 1
    `,[mainInfoStr])
    await db.query(`
      update site_info
        set data = ?
      where
        type = 2
    `,[recentDaysStatisticsStr])
    await db.query(`
      update site_info
        set data = ?
      where
        type = 3
    `,[ownerInfoStr])
    tempSiteInfo = currentSiteInfo
  }
}
setInterval(() => {
  timingAddData()
}, updateTime) 
// 操作
function addBrowsedCount(){
  isNewDay()
  siteInfo.recentDaysStatistics[recentDays - 1].dayBrowsedCount += 1
  siteInfo.mainInfo.allBrowsedCount += 1
}
function addLikedCount(){
  isNewDay()
  siteInfo.recentDaysStatistics[recentDays - 1].dayLikedCount += 1
  siteInfo.mainInfo.allLikedCount += 1
}
function addBlogBrowsedCount(){
  isNewDay()
  siteInfo.recentDaysStatistics[recentDays - 1].dayBlogBrowsedCount += 1
  siteInfo.mainInfo.allBlogBrowsedCount += 1
}
function updateOwnerInfo(body){
  let {ownerBasicInfo, ownerSkillInfo} = body
  siteInfo.ownerInfo.ownerBasicInfo = ownerBasicInfo
  siteInfo.ownerInfo.ownerSkillInfo = ownerSkillInfo
}

function getSiteInfo(){
  return siteInfo
}

module.exports = {
  init,
  getSiteInfo,
  addBrowsedCount,
  addLikedCount,
  addBlogBrowsedCount,
  updateOwnerInfo
}
