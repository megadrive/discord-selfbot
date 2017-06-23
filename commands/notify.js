'use strict'

let jsonfile = require('jsonfile')
let notifyFile = './db/notify.json'
let notifier = require('../notifier')

module.exports = {
  aliases: ['notify'],
  event: 'message',
  'depends-on-flag': ['notify']
}

// Special function _only_ for notify.
module.exports.init = function () {
  notifier.login()
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Allows you to set words to be notified about via DM.`,
    usage: [
      `${conf.prefix}${module.exports.aliases[0]} add [word]`,
      `${conf.prefix}${module.exports.aliases[0]} remove [word]`,
      `${conf.prefix}${module.exports.aliases[0]} list`
    ]
  }
}

module.exports.module = function (message) {
  // If message was said by owner, ignore
  if (message.author.id === require('../config')['owner-id']) return

  let words = jsonfile.readFileSync(notifyFile, {throw: false})
  if (words.data !== null) {
    words.data.forEach(function (word) {
      if (message.content.includes(word)) {
        let them = message.member
        let server = message.guild

        // Only occur if in a TextChannel (and not a DMChannel or GroupDMChannel)
        if (server) {
          let send = `[notify] '${word}' was said in ${server} by ${them}:\n${message.content}`
          if (notifier.ready) notifier.sendNotification(send)
        }
      }
    })
  }
}

module.exports.run = function (message) {
  message.delete()
  let args = message.content.split(' ')
  if (message.content.indexOf(' ') >= 0) {
    let action = args[1] !== undefined ? args[1] : null
    let word = args[2] !== undefined ? args[2].toLowerCase() : null

    args = message.content.split(' ')

    let json = jsonfile.readFileSync(notifyFile, {throws: false})
    if (json === null) json = {data: []}

    let reply = `[notify] Word '${word}' `
    if (action === 'add') {
      if (json.data.includes(word) === false) {
        json.data.push(word)
        reply += `was added. You will receive a notification when this is said.`
      } else {
        reply += `is already in the list.`
      }
    } else if (action === 'remove') {
      let index = json.data.indexOf(word)
      if (index === -1) {
        reply += `isn't on the list.`
      } else {
        json.data.splice(index, 1)
        reply += `was removed from the list.`
      }
    } else if (action === 'list') {
      reply += `Words you are currently being notified about:\n${json.data.join(', ')}`
    } else {
      reply = `[notify] Available actions are 'add <word> and remove <word>`
    }

    jsonfile.writeFileSync(notifyFile, json)
    message.channel.send('`' + reply + '`')
  }
}
