'use strict'

module.exports = {
  aliases: ['embed'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()
  let url = null
  if (message.content.indexOf(' ') >= 0) {
    url = message.content.substr(message.content.indexOf(' ') + 1)
  }
  message.channel.send({files: [{attachment: url}]})
}
