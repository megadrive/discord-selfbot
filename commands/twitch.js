'use strict'

let g = require('../db/twitch_global.json')
let got = require('got')
let fs = require('fs')

module.exports = {
  aliases: ['twitch', 'tw'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Changes what game you're 'streaming'. NOTE: You cannot see this but others can.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} [string]`]
  }
}

module.exports.run = function (message) {
  message.delete()

  let split = message.content.split(' ')
  let raw = split[1]
  let scale = split[2] ? split[2].toLowerCase() : 'small'
  let emote = g.emotes[raw]

  if (emote !== undefined) {
    let url = g.template[scale].replace('{image_id}', emote.image_id)
    let path = `./temp/${raw}.png`
    got.stream(url).pipe(fs.createWriteStream(path))
      .on('close', function () {
        message.channel.send({files: [{attachment: path}]})
          .then(function () {
            console.info(`Used Twitch emote ${raw}`)
            fs.unlinkSync(path)
          })
      })
  }
}
