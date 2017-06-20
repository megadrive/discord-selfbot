'use strict'

let got = require('got')

module.exports = {
  aliases: ['cat', 'kitteh'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Outputs a random cat picture as a file attachment.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]}`]
  }
}

module.exports.run = function (message) {
  message.delete()

  got('http://shibe.online/api/cats?count=1', {json: true})
    .then(function (res) {
      message.channel.send(`Random catten!`, {files: [{attachment: res.body[0]}]})
    })
}
