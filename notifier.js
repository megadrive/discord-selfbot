
/**
 * This creates a second Discord client, specifically for sending DMs as notifications.
 */

let Discord = require('discord.js')
let conf = require('./config')
let notifierToken = conf['notifier-token']
let notifier = new Discord.Client()

module.exports = {
  ready: false,
  login: () => {
    notifier.login(notifierToken)
      .catch(function (err) {
        console.error(`'Notifier failed to login: ${err}`)
      })
  },
  sendNotification: function (message) {
    console.info(`Sending DM notification: ${message}`)

    let recipient = notifier.user.friends.first()
    recipient.send(message)
  }
}

notifier.on('ready', () => {
  console.info('Notifier ready.')
  module.exports.ready = true
})
