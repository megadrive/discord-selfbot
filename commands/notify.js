'use strict'

let jsonfile = require('jsonfile')

module.exports = {
  aliases: ['notify'],
  event: 'message'
}

let notifyFile = './notify.json'
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
    } else {
      reply = `[notify] Available actions are 'add <word> and remove <word>`
    }

    jsonfile.writeFileSync(notifyFile, json)
    message.channel.send('`' + reply + '`')
  }
}
