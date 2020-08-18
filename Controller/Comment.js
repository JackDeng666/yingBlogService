class Comment {
  constructor(){
  }
  // 添加评论
  async addComment(ctx){
    let { userId, blogId, replyTo, content } = ctx.request.body
    await ctx.db.query(`
      insert into 
        comments 
      (user_id, blog_id, reply_to, content) 
        values
      (?,?,?,?)
    `, [userId,blogId,replyTo,content])
    ctx.body = {
      meta: { status:1, msg: '添加评论成功' }
    }
  }
  // 获取评论列表
  async getCommentList(ctx){
    let {currentPage, pageSize} = ctx.request.query
    let left = ( Number(currentPage) - 1) * Number(pageSize)
    let queryParams = []
    queryParams.push(left, Number(pageSize))
    let result = await ctx.db.query(`
      select
        comments.id as id,
        nick_name as userNickName,
        created_time as createdTime,
        content
      from comments
        inner join users on comments.user_id=users.id
      order by
        comments.created_time desc
      limit ?,?
    `, queryParams)
    let total = await ctx.db.query('select count(1) as value from comments')
    ctx.body = {
      data: {
        commentList: result,
        total: total[0].value
      },
      meta: { status:1, msg: '获取评论列表成功' }
    }
  }
  // 根据博客id获取评论列表
  async getCommentListByBlogId(ctx) {
    let { blogId } = ctx.request.query
    let commentList = await ctx.db.query(`
      select 
        comments.id,
        comments.reply_to,
        comments.content,
        comments.created_time,
        users.nick_name,
        users.avatar
      from comments 
        INNER JOIN users ON comments.user_id=users.id
      where blog_id=?
      order by
        comments.created_time desc
    `, [blogId])
    // 获取回复的id
    let replyIds = []
    commentList.forEach(element => {
      if(element.reply_to != null){
        replyIds.push(element.reply_to)
      }
    })
    // 组装
    let i = 0, j = 0
    while(i < replyIds.length){
      if(commentList[j].reply_to == null){
        j++
      } else {
          // 查出回复的用户信息
          let reply_users = await ctx.db.query(`
          select
            users.nick_name
          from comments
            INNER JOIN users ON comments.user_id=users.id
          where comments.id=?
        `, [replyIds[i]])
        commentList[j].reply_to_nick_name = reply_users[0].nick_name
        i++
        j++
      }
    }
    ctx.body = {
      data: {
        commentList: commentList
      },
      meta: { status:1, msg: '获取评论成功' }
    }
  }

  async deleteComment(ctx){
    let {commentId} = ctx.request.body
    await ctx.db.query(`
      delete from comments where id=?
    `, [commentId])
    ctx.body = {
      meta: { status: 1, msg: '删除评论成功' }
    }
  }
}

module.exports = new Comment()
