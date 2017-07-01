'use strict'

let YouTube = require('youtube-node')
let youtube = new YouTube()
let config = require('../config')
youtube.setKey(config.google_apikey)
youtube.addParam('type', 'video')

module.exports = {
  aliases: ['youtube', 'yt'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Searches for and returns the first YouTube video that matches the <query>`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} <query>`]
  }
}

module.exports.run = function (message) {
  message.delete()

  let query = ''
  let split = message.content.split(' ')
  if (split.length > 1) {
    query = split.slice(1)
  }

  youtube.search(query, 1, function (err, result) {
    if (err) throw Error(err)

    let item = result.items[0]
    let reply = `${item.snippet.title} -- https://youtube.com/watch?v=${item.id.videoId}`
    message.channel.send(reply)
  })
}
