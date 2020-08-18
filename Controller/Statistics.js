class Statistics {
  constructor(){
  }
  // 通过用户id和对象id获取点赞信息
  async getPraise(ctx) {
    let { userId, objectId } = ctx.request.query
    let result = await ctx.db.query(`
      select 
        * 
      from 
        praises
      where from_uid=? and object_id=? limit 1`, [userId, objectId])
    return ctx.body = {
      data: {
        result
      },
      meta: { status: 1, msg: '点赞数据获取成功' }
    }
  }
  // 通过博客id获取博客被点赞计数
  async getPraiseCountByBid(ctx) {
    let { objectId } = ctx.request.query
    let result = await ctx.db.query(`
      select 
        count(*) as value 
      from 
        praises 
      where 
        object_id=? 
      and
        is_cancelled=0`, [objectId])
    ctx.body = {
      data: {
        praisedNum: result[0].value
      },
      meta: { status: 1, msg: '点赞计数获取成功' }
    }
  }
  // 添加点赞信息
  async addPraise(ctx) {
    let { userId, objectId } = ctx.request.body
    await ctx.db.query(`
      insert into 
        praises 
      (from_uid,object_id)
        values 
      (?,?)`, [userId, objectId])
    ctx.body = {
      meta: { status: 1, msg: '点赞数据添加成功' }
    }
  }
  // 修改是否点赞
  async upatePraise(ctx) {
    let { isCancelled, userId, objectId } = ctx.request.body
    await ctx.db.query(`
      update praises 
      set 
        is_cancelled=?
      where
        from_uid=?
      and
        object_id=?
      `, [isCancelled, userId, objectId])
    ctx.body = {
      meta: { status: 1, msg: '点赞数据修改成功' }
    }
  }
  // 切换用户对博客的点赞状态，没有数据默认添加
  togglePraise = async ctx => {
    ctx.request.query = ctx.request.body
    let isPraised = await this.getPraise(ctx)
    //判断此点赞信息是否存在
    if (isPraised.data.result.length) {
      await this.upatePraise(ctx)
    } else {
      await this.addPraise(ctx)
    }
  }
  // 通过用户id和对象id获取收藏信息
  async getCollect(ctx) {
    let { userId, objectId } = ctx.request.query
    let result = await ctx.db.query(`
      select 
        * 
      from 
        collects 
      where from_uid=? and object_id=? limit 1`, [userId, objectId])
    return ctx.body = {
      data: {
        result
      },
      meta: { status: 1, msg: '收藏数据获取成功' }
    }
  }
  // 通过博客id获取博客被收藏计数
  async getCollectCountByBid(ctx) {
    let { objectId } = ctx.request.query
    let result = await ctx.db.query(`
      select 
        count(*) as value 
      from 
        collects 
      where 
        object_id=?
      and
        is_cancelled=0`, [objectId])
    ctx.body = {
      data: {
        collectedNum: result[0].value
      },
      meta: { status: 1, msg: '收藏计数获取成功' }
    }
  }
  // 添加收藏
  async addCollect(ctx) {
    let { userId, objectId } = ctx.request.body
    await ctx.db.query(`
      insert into 
        collects 
      (from_uid,object_id)
        values 
      (?,?)`, [userId, objectId])
    ctx.body = {
      meta: { status: 1, msg: '收藏数据添加成功' }
    }
  }
  // 修改是否收藏
  async upateCollect(ctx) {
    let { isCancelled, userId, objectId } = ctx.request.body
    await ctx.db.query(`
      update collects 
      set 
        is_cancelled=?
      where
        from_uid=?
      and
        object_id=?
      `, [isCancelled, userId, objectId])
    ctx.body = {
      meta: { status: 1, msg: '收藏数据修改成功' }
    }
  }
  // 切换用户对博客的收藏状态，没有数据默认添加
  toggleCollect = async ctx => {
    ctx.request.query = ctx.request.body
    let isCollect = await this.getCollect(ctx)
    // 判断此收藏信息是否存在
    if (isCollect.data.result.length) {
      this.upateCollect(ctx)
    } else {
      this.addCollect(ctx)
    }
  }
  getSiteInfo(ctx){
    ctx.body = {
      data: {
        siteInfo: ctx.statisticsCacheUtil.getSiteInfo()
      },
      meta: {
        status: 1,
        msg: "获取网站信息成功"
      }
    }
  }
  addBrowsedCount(ctx){
    ctx.statisticsCacheUtil.addBrowsedCount()
    ctx.body = {
      meta: {
        status: 1,
        msg: "添加网站浏览成功"
      }
    }
  }
  addLikedCount(ctx){
    ctx.statisticsCacheUtil.addLikedCount()
    ctx.body = {
      meta: {
        status: 1,
        msg: "添加点赞成功"
      }
    }
  }
  addBlogBrowsedCount(ctx){
    ctx.statisticsCacheUtil.addBlogBrowsedCount()
    ctx.body = {
      meta: {
        status: 1,
        msg: "添加博客点击成功"
      }
    }
  }
  updateOwnerInfo(ctx){
    ctx.statisticsCacheUtil.updateOwnerInfo(ctx.request.body)
    ctx.body = {
      meta: {
        status: 1,
        msg: "修改站主信息成功"
      }
    }
  }
}

module.exports = new Statistics()
