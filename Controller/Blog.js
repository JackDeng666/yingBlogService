class Blog {
  constructor() {
  }
  // 获取博客分类
  async getBlogTypes(ctx) {
    let result = await ctx.db.query('select * from blog_types')
    ctx.body = {
      data: result,
      meta: {
        status: 1,
        msg: '请求成功'
      }
    }
  }
  // 添加博客分类
  async addBlogTypes(ctx) {
    let {typeName} = ctx.request.body
    await ctx.db.query(`
      insert into 
      blog_types (type_name) 
      values (?)
    `,[typeName])
    ctx.body = {
      meta: {
        status: 1,
        msg: '添加博客分类成功'
      }
    }
  }
  // 修改博客分类
  async updateBlogTypes(ctx) {
    let {id, typeName} = ctx.request.body
    await ctx.db.query(`
      update blog_types 
      set 
        type_name = ?
      where 
        id = ?
    `, [typeName, id])
    ctx.body = {
      meta: {
        status: 1,
        msg: '修改博客分类成功'
      }
    }
  }
  // 删除博客分类
  async deleteBlogTypes(ctx) {
    let {typeId} = ctx.request.body
    await ctx.db.query(`
      delete from 
        blog_types 
      where
        id = ?
    `, [typeId])
    ctx.body = {
      meta: {
        status: 1,
        msg: '删除博客分类成功'
      }
    }
  }
  // 通过当前页，每页数量，获取对应状态的博客列表
  async getBlogList(ctx) {
    let { status, currentPage, pageSize } = ctx.request.query
    let left = (Number(currentPage) - 1) * Number(pageSize)
    let blogList = await ctx.db.query(`
      select 
        blogs.id,
        title,
        \`describe\`,
        created_time,
        browsed_count,
        blog_type_id,
        type_name
      from
        blogs
        INNER JOIN blog_types ON blogs.blog_type_id=blog_types.id
      where blogs.status=?
      order by
        created_time desc
      limit ?,?
    `, [status, left, Number(pageSize)])
    let total = await ctx.db.query(`select count(*) as value from blogs where status=?`,[status])
    ctx.body = {
      data: {
        blogList,
        total: total[0].value
      },
      meta: {
        status: 1,
        msg: '请求成功'
      }
    }
  }
  // 通过博客分类，当前页，每页数量，获取对应状态的博客列表
  async getBlogListByType(ctx) {
    let { typeId, status, currentPage, pageSize } = ctx.request.query
    let left = (Number(currentPage) - 1) * Number(pageSize)
    let blogList = await ctx.db.query(`
      select 
        blogs.id,
        title,
        \`describe\`,
        created_time,
        browsed_count,
        blog_type_id,
        type_name 
      from
        blogs
        INNER JOIN blog_types ON blogs.blog_type_id=blog_types.id
      where blogs.blog_type_id=? and blogs.status=?
      order by
        id desc
      limit ?,?
    `, [typeId, Number(status), left, Number(pageSize)])
    let total = await ctx.db.query(`select count(*) as value from blogs where blog_type_id=? and status=?`, [typeId, Number(status)])
    ctx.body = {
      data: {
        blogList,
        total: total[0].value
      },
      meta: {
        status: 1,
        msg: '请求成功'
      }
    }
  }
  // 通过用户收藏id，当前页，每页数量，获取用户收藏的博客列表
  async getCollectBlogListByUid(ctx) {
    let { userId, currentPage, pageSize } = ctx.request.query
    // 获取用户收藏的博客id
    let r1 = await ctx.db.query(`
      select
        object_id
      from 
        collects 
      where from_uid=? and is_cancelled=0`, [userId])
    let blogIds = new Array()
    if (!r1.length) {
      ctx.body = {
        meta: {
          status: 0,
          msg: '没有数据'
        }
      }
    }
    for (let i = 0; i < r1.length; i++) {
      blogIds.push(r1[i].object_id)
    }
    let left = (Number(currentPage) - 1) * Number(pageSize)
    let blogList = await ctx.db.query(`
      select 
        blogs.id,
        title,
        \`describe\`,
        created_time,
        browsed_count,
        blog_type_id,
        type_name 
      from
        blogs
        INNER JOIN blog_types ON blogs.blog_type_id=blog_types.id
      where 
        blogs.id 
      in (?)
      order by
        id desc
      limit ?,?
    `, [blogIds, left, Number(pageSize)])
    ctx.body = {
      data: {
        blogList,
        total: r1.length
      },
      meta: {
        status: 1,
        msg: '请求成功'
      }
    }
  }
  // 获取博客详细内容
  async getBlogDetail(ctx) {
    let { blogId } = ctx.request.query
    let blogDetail = await ctx.db.query(`
      select 
        blogs.id,
        title,
        \`describe\`,
        created_time,
        md_content,
        html_content,
        browsed_count,
        blog_type_id,
        type_name 
      from blogs 
        INNER JOIN blog_types ON blogs.blog_type_id=blog_types.id 
      where blogs.id=?
    `, [blogId])
    if (blogDetail.length) {
      ctx.body = {
        data: {
          blogDetail: blogDetail[0]
        },
        meta: { status: 1, msg: '获取成功' }
      }
    } else {
      ctx.body = {
        meta: { status: 0, msg: '没有这个数据' }
      }
    }
  }
  // 添加博客被浏览次数
  async addBlogBrowsedCount(ctx) {
    let { browsedCount, blogId } = ctx.request.body
    await ctx.db.query(`
      update blogs
      set
        browsed_count=?
      where
        id=?
    `, [browsedCount, blogId])
    ctx.body = {
      meta: { status: 1, msg: '添加成功' }
    }
  }
  // 后台权限操作
  // 添加一篇博客
  async addBlog(ctx) {
    let { blog } = ctx.request.body
    await ctx.db.query(`
      insert into 
        blogs 
      (title,\`describe\`,md_content,html_content,created_time,blog_type_id,status) 
        values
      (?,?,?,?,?,?,?)
    `, blog)
    ctx.body = {
      meta: { status: 1, msg: '博客添加成功' }
    }
  }
  // 修改博客内容
  async updateBlogDetail(ctx) {
    let { title, describe, md_content, html_content, created_time, blog_type_id, status, id } = ctx.request.body
    await ctx.db.query(`
      update blogs
      set
        title=?,
        \`describe\`=?,
        md_content=?,
        html_content=?,
        created_time=?,
        blog_type_id=?,
        status=?
      where
        id=?
    `, [title, describe, md_content, html_content, created_time, blog_type_id, status, id])
    ctx.body = {
      meta: { status: 1, msg: '博客修改成功' }
    }
  }
  // 删除博客
  async deleteBlog(ctx) {
    let { blogId } = ctx.request.body
    await ctx.db.query(`
      delete from blogs where id=?
    `, [blogId])
    ctx.body = {
      meta: { status: 1, msg: '博客删除成功' }
    }
  }
}

module.exports = new Blog()
