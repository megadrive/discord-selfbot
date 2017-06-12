'use strict'

module.exports = {
  aliases: ['up', 'alive'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()
  message.channel.send('I\'m here!')
}
