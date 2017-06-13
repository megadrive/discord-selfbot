'use strict'

let g = require('../twitch_global.json')
let got = require('got')
let fs = require('fs')

module.exports = {
  aliases: ['twitch', 'tw'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()

  //let raw = message.content.substr(message.content.indexOf(' ') + 1)
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
