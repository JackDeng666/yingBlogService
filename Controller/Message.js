class Message {
  constructor(){
  }
  // 通过当前页，每页条数，获取留言列表
  async getMessageList(ctx) {
    let {currentPage, pageSize} = ctx.request.query
    let left = ( Number(currentPage) - 1) * Number(pageSize)
    let queryParams = []
    queryParams.push(left, Number(pageSize))
    let result = await ctx.db.query(`
      select
        messages.id as id,
        nick_name as userNickName,
        avatar as userAvatar,
        created_time as createdTime,
        content
      from messages
        inner join users on messages.from_uid=users.id
      order by
        messages.id desc
      limit ?,?
    `, queryParams)
    let isLastPage
    let total = await ctx.db.query(`select count(1) as value from messages`)
    // 如果是最后一页数据
    if(result.length < Number(pageSize)){
      isLastPage = true
    }else{
      isLastPage = false
    }
    ctx.body = {
      data: {
        messageList: result,
        isLastPage,
        total: total[0].value
      },
      meta: { status: 1, msg: '获取留言列表成功' }
    }
  }

  // 添加一条留言
  async addMessage(ctx) {
    let {userId,content} = ctx.request.body
    await ctx.db.query(`
      insert into 
        messages 
      (from_uid,content) 
        values
      (?,?)
    `, [userId,content])
    ctx.body = {
      meta: { status: 1, msg: '添加留言成功' }
    }
  }
  // 删除一条留言
  async deleteMessage(ctx) {
    let {messageId} = ctx.request.body
    await ctx.db.query(`
      delete from messages where id=?
    `, [messageId])
    ctx.body = {
      meta: { status: 1, msg: '删除留言成功' }
    }
  }
}

module.exports = new Message()
