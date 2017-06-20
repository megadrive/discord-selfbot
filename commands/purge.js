'use strict'

let conf = require('../config.json')

module.exports = {
  aliases: ['purge'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Deletes your last 10 messages. If you supply a number as an argument, it will delete that many to a maximum of 100.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]}`, `${conf.prefix}${module.exports.aliases[0]} 40`]
  }
}

module.exports.run = function (message) {
  message.delete()

  let args = message.content.split(' ')
  let lmt = args[1] !== undefined ? args[1] : 10

  message.channel.fetchMessages({limit: lmt})
    .then(function (messages) {
      let filteredMessages = messages.filter(function (e) {
        return (e.author.id === conf['owner-id'])
      })

      filteredMessages.deleteAll()
    })
}
