const TokenUtil = require('../utils/TokenUtil')
const sendEmail = require('../utils/sendEmail')

class User {
  constructor(){
  }
  // 判断用户名是否存在
  async userNameIsExist(db, userName){
    let data = await db.query("select * from users where user_name = ?",[userName])
    if(data.length){
      return true
    }else{
      return false
    }
  }
  // 判断邮箱是否存在
  async userEmailIsExist(db,email){
    let data = await db.query("select * from users where email = ?",[email])
    if(data.length){
      return true
    }else{
      return false
    }
  }
  //  获取邮箱验证码
  getVerificationCode = async ctx => {
    let {toEmail} = ctx.request.query
    if(await this.userEmailIsExist(ctx.db,toEmail)){
      ctx.body = {
        meta: { status: 0, msg:'邮箱已存在' }
      }
    }else{
      //随机生成6位数字
      let emailCode  = (function captchaNumber(){
        let num = [];
        for (let i = 0; i < 6; i++) {
          num[i] = parseInt(Math.random()*10)
        }
        return num.join('')
      })()
      let email = {
        title: '邮箱验证码',
        body:`
          <h1>您好：</h1>
          <p style="font-size: 18px;color:#000;">
            您的验证码为：
            <span style="font-size: 16px;color:#f00;"> ${ emailCode }， </span>
            您当前正在前端舰长JD的个人博客学习网站注册账号。
          </p>
          <p style="font-size: 1.5rem;color:#999;">3分钟内有效</p>
        `
      }
      let emailCotent = {
        from: '3216066442@qq.com', // 发件人地址
        to: toEmail, // 收件人地址，多个收件人可以使用逗号分隔
        subject: email.title,  // 邮件标题
        html: email.body  // 邮件内容
      }
      sendEmail.send(emailCotent)
      ctx.body = {
        data: {
          emailCode
        },
        meta: { status: 1, msg: '验证码发送成功' }
      }
    }
  }
  // 用户注册
  register = async ctx => {
    let {userName, nickName, email, password} = ctx.request.body
    if( await this.userNameIsExist(ctx.db, userName) ){
      return ctx.body = {
        meta:{ status: 0, msg: '用户名已存在' }
      }
    }
    if( await this.userEmailIsExist(ctx.db, email) ){
      return ctx.body = {
        meta:{ status: 0, msg: '邮箱已存在' }
      }
    }
    let ciphertext = require('../utils/encryption')(password) //加密密码
    await ctx.db.query("insert into users (user_name,nick_name,email,password) values (?,?,?,?)",[userName,nickName,email,ciphertext])
    ctx.body = {
      meta: { status: 1, msg: '注册成功' }
    }
  }
  // 用户登录
  login = async ctx => {
    let { loginName, password } = ctx.request.body
    if( await this.userNameIsExist(ctx.db, loginName) || await this.userEmailIsExist(ctx.db, loginName) ){    // 判断用户名或邮箱是否存在
      let userInfo
      // 通过用户名或邮箱获取账户信息
      let result = await ctx.db.query("select * from users where user_name = ? limit 1",[loginName])
      if(result.length){
        userInfo = result[0]
      }else{
        let result = await ctx.db.query("select * from users where email = ? limit 1",[loginName])
        userInfo = result[0]
      }                   
      if( userInfo.password == require('../utils/encryption')(password) ){         // 判断密码是否正确
        let payload = {
          userInfo
        }
        let token = await TokenUtil.createUserToken(payload)
        ctx.body = {
          token,
          meta: { status: 1, msg: '登录成功' }
        }
      }else{
        ctx.body = { 
          meta: { status: 0, msg: '密码错误' }
        }
      }
    }else{
      ctx.body = {
        meta: { status: 0, msg: '用户名或邮箱不存在' }
      }
    }
  }
  // 获取用户信息
  getUserInfo = async ctx => {
    let { getBy } = ctx.request.query
    if( await this.userNameIsExist(ctx.db, getBy) || await this.userEmailIsExist(ctx.db, getBy) ){    // 判断用户名或邮箱是否存在
      let result = await ctx.db.query("select * from users where user_name = ? limit 1",[getBy])
      if(result.length){
        ctx.body = {
          data: {
            userInfo: result[0]
          },
          meta: { status: 1, msg: '获取用户信息成功'}
        }
      }else{
        let result = await ctx.db.query("select * from users where email = ? limit 1",[getBy])
        ctx.body = {
          data: {
            userInfo: result[0]
          },
          meta: { status: 1, msg: '获取用户信息成功'}
        }
      }
    }else{
      ctx.body = {
        meta: { status: 0, msg: '用户名或邮箱不存在' }
      }
    }
  }
  // 查询token是否有效
  async checkToken(ctx){
    let {token} = ctx.request.body
    if (await TokenUtil.isValid(token)) {
      ctx.body = {
        meta :{ status: 1, msg:'token有效' }
      }
    } else {
      ctx.body = {
        meta: { status: 0, msg:'token无效' }
      }
    }
  }
  // 修改用户信息
  async updateUserInfo(ctx){
    let {avatar,nickName,sex,userId} = ctx.request.body
    try {
      await ctx.db.query(`
        update users
        set 
          avatar=?,
          nick_name=?,
          sex=? 
        where 
          id=?`
      ,[avatar,nickName,sex,userId])
      ctx.body = {
        meta: { status: 1, msg:'修改成功' }
      }
    } catch (error) {
      ctx.body = {
        meta: { status: 0, msg:'修改失败' + error }
      }
    }
  }
  // 获取用户列表
  async getUserList(ctx){
    let {currentPage, pageSize} = ctx.request.query
    let left = ( Number(currentPage) - 1) * Number(pageSize)
    let queryParams = []
    queryParams.push(left, Number(pageSize))
    let result = await ctx.db.query('select * from users limit ?,?',queryParams)
    let userList = []
    result.map((item)=>{
      userList.push({
        userName: item.user_name,
        email: item.email,
        nickName: item.nick_name,
        avatar: item.avatar,
        sex: item.sex,
        id: item.id
      })
    })
    let total = await ctx.db.query('select count(1) as value from users')
    ctx.body = {
      data: {
        userList,
        total: total[0].value
      },
      meta: { status: 1, msg:'获取用户列表成功' }
    }
  }
  // 删除用户
  async deleteUser(ctx){
    let {userId} = ctx.request.body
    await ctx.db.query('delete from users where id=?',[userId])
    ctx.body = {
      meta: { status: 1, msg: '删除用户成功' }
    }
  }
  // 管理员登录
  async adminLogin(ctx){
    let { name, password } = ctx.request.body
    let md5Password = require('../utils/encryption')(password)
    let res = await ctx.db.query(`
      select 
        count(1) as num 
      from users 
      where user_name = ? and password = ? and power = 3`
    ,[name, md5Password])
    if(res[0].num > 0){
      let token = await TokenUtil.createAdminToken()
      ctx.body = {
        data: {
          token
        },
        meta: { status: 1, msg: '管理员登录成功' }
      }
    } else {
      ctx.body = {
        meta: { status: 0, msg: '管理员登录失败' }
      }
    }
  }
}

module.exports = new User()
