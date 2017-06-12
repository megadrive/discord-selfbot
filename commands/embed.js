'use strict'

module.exports = {
  aliases: ['embed'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()
  let url = message.content.substr(message.content.indexOf(' ') + 1)
  message.channel.sendFile(url)
}
