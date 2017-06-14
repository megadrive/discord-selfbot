'use strict'

let dateDifference = require('date-difference')

module.exports = {
  aliases: ['up', 'alive'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()

  let then = new Date()
  then.setTime(Date.now() - message.client.uptime)
  let now = new Date()

  message.channel.send(`Selfbot uptime: ${dateDifference(then, now)}`)
}
