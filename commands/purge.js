'use strict'

let conf = require('../config.json')

module.exports = {
  aliases: ['purge'],
  event: 'message'
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
