const process = require('process')

let mode = process.env.OS == 'Windows_NT' ? 'dev' : 'prod'

module.exports = {
  mode,
  keys:{
    salt1: 'dlia84',
    salt2: 'poa94oq',
    secret: 'qpmzgh'
  },
  ...(mode == 'dev' ? require('./config.dev') : require('./config.prod'))
}
