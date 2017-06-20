'use strict'

let got = require('got')

module.exports = {
  aliases: ['doge'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Outputs a random doge picture as a file attachment.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]}`]
  }
}

module.exports.run = function (message) {
  message.delete()

  got('http://shibe.online/api/shibes?count=1', {json: true})
    .then(function (res) {
      message.channel.send(`Random doge!`, {files: [{attachment: res.body[0]}]})
    })
}
