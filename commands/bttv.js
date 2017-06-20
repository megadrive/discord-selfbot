'use strict'

let bttv = require('../db/bttv.json').emotes
let got = require('got')
let fs = require('fs')

module.exports = {
  aliases: ['bttv'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Outputs a BTTV emote as a file attachment. Only supports _global_ emotes.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} [Global BTTV emote]`]
  }
}

module.exports.run = function (message) {
  message.delete()

  let split = message.content.split(' ')
  let raw = split[1]

  let emote = bttv.filter(function (em) {
    return em.regex === raw
  })

  if (emote.length) {
    let url = 'http:' + emote[0].url
    let path = `./temp/${raw.replace(/[^A-Za-z0-9]/g, '')}.png`
    got.stream(url).pipe(fs.createWriteStream(path))
      .on('close', function () {
        message.channel.send({files: [{attachment: path}]})
          .then(function () {
            console.info(`Used BTTV emote ${raw}`)
            fs.unlinkSync(path)
          })
      })
  }
}
