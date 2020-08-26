const fs = require('fs')
const path = require('path')
const UploadUtil = require('../utils/uploadUtil')
const GetRadomName = require('../utils/randomName')
const {RESOURCE_URL} = require('../config')

class Song {
  constructor(){
  }
  async addSongList(ctx) {
    let {songListId,songListName,isLocal} = ctx.request.body
    let songListType = 1
    // 如果为本地歌单
    if(isLocal==1){
      let id = GetRadomName(10,10,"Num")
      let pathName = path.join(__dirname, `../static/resource/music/${id}`)
      UploadUtil.checkDirExistAndCreate(pathName)
      songListId = id
      songListType = 2
    }
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
    let {id,songListType,songListId} = ctx.request.body
    await ctx.db.query(`delete from song_lists where id = ?`,[id])
    // 如果是本地歌单也要删除整个文件
    if(songListType == 2){
      let dirPath = path.join(__dirname, `../static/resource/music/${songListId}`)
      UploadUtil.delFile(dirPath)
    }
    ctx.body = {
      meta: { status: 1, msg: '删除歌单成功' }
    }
  }
  async updateSongList(ctx) {
    let {songListId,songListName,id,isLocal} = ctx.request.body
    // 如果是操作本地歌单，只能修改名字
    if(isLocal==1){
      await ctx.db.query(`
        update song_lists
        set
          song_list_name = ?
        where 
          id = ?
      `,[songListName,id])
    } else {
      await ctx.db.query(`
        update song_lists
        set
          song_list_id = ?,
          song_list_name = ?
        where 
          id = ?
      `,[songListId,songListName,id])
    }
    ctx.body = {
      meta: { status: 1, msg: '修改歌单成功' }
    }
  }
  async getSongList(ctx) {
    let {songListType} = ctx.request.query
    let result
    // 此参数存在
    if(songListType){
      result = await ctx.db.query(`select * from song_lists where song_list_type = ? `,[songListType])
    } else {
      result = await ctx.db.query(`select * from song_lists`)
    }
    ctx.body = {
      data: {
        songList: result
      },
      meta: { status: 1, msg: '获取歌单成功' }
    }
  }
  async getLocalSongByListId(ctx) {
    let {listId} = ctx.request.query
    let pathName = path.join(__dirname, `../static/resource/music/${listId}`)
    let files = fs.readdirSync(pathName)
    let songList = []
    for (let i = 0; i < files.length; i++) {
      let data = {}
      data.name = files[i]
      data.url =  RESOURCE_URL + `music/${listId}/${files[i]}`
      songList.push(data)
    }
    ctx.body = {
      meta :{
        status: 1,
        msg: "获取歌单列表成功"
      },
      songList 
    }
  }
}

module.exports = new Song()
