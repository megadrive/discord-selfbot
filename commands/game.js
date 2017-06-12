'use strict'

module.exports = {
  aliases: ['game'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()
  let game = null
  if (message.content.indexOf(' ') >= 0) {
    game = message.content.substr(message.content.indexOf(' ') + 1)
  }
  message.client.user.setGame(game)
  console.info(`Set game to ${game}`)
}
