class Song {
  constructor(){
  }
  async addSongList(ctx) {
    let {songListId,songListName,songListType} = ctx.request.body
    await ctx.db.query(`
      insert into 
        song_lists
        (song_list_id,song_list_name,song_list_type)
      values
        (?,?,?)
    `,[songListId,songListName,songListType])
    ctx.body = {
      meta: { status: 1, msg: '添加歌单成功' }
    }
  }
  async deleteSongList(ctx) {
    let {id} = ctx.request.body
    await ctx.db.query(`delete from song_lists where id = ?`,[id])
    ctx.body = {
      meta: { status: 1, msg: '删除歌单成功' }
    }
  }
  async updateSongList(ctx) {
    let {songListId,songListName,songListType,id} = ctx.request.body
    await ctx.db.query(`
      update song_lists
      set
        song_list_id = ?,
        song_list_name = ?,
        song_list_type = ?
      where 
        id = ?
    `,[songListId,songListName,songListType,id])
    ctx.body = {
      meta: { status: 1, msg: '修改歌单成功' }
    }
  }
  async getSongList(ctx) {
    let result = await ctx.db.query(`select * from song_lists`)
    ctx.body = {
      data: {
        songList: result
      },
      meta: { status: 1, msg: '获取歌单成功' }
    }
  }
}

module.exports = new Song()
