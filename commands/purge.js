'use strict'

let conf = require('../config.json')

module.exports = {
  aliases: ['purge'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()

  message.channel.fetchMessages({limit: 100})
    .then(function (messages) {
      let filteredMessages = messages.filter(function (e) {
        return (e.author.id === conf['owner-id'])
      })

      filteredMessages.deleteAll()
    })
}
