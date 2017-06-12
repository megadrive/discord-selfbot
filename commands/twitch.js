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

  let raw = message.content.substr(message.content.indexOf(' ') + 1)
  let emote = g.emotes[raw]

  if (emote !== undefined) {
    let url = g.template.small.replace('{image_id}', emote.image_id)
    got.stream(url).pipe(fs.createWriteStream(`./twitch/${raw}.png`))
      .on('close', function () {
        message.channel.sendFile(`./twitch/${raw}.png`)
      })
  }
}
