'use strict'

module.exports = {
  aliases: ['game'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Changes what game you're 'playing'. NOTE: You cannot see this but others can.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} [string]`]
  }
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
