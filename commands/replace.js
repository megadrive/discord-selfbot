'use strict'

let jsonfile = require('jsonfile')
let RichEmbed = require('discord.js').RichEmbed

module.exports = {
  aliases: ['replace', 'repl'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Adds, removes or lists replacement text. This will replace any {{key}} in a message with the value.`,
    usage: [
      `${conf.prefix}${module.exports.aliases[0]} add [key] [replacement text]`,
      `${conf.prefix}${module.exports.aliases[0]} remove [key]`,
      `${conf.prefix}${module.exports.aliases[0]} list`
    ]
  }
}

let replaceFile = './db/replace.json'

module.exports.module = function (message) {
  let json = jsonfile.readFileSync(replaceFile, {throws: false})
  if (json === null) json = {data: []}

  let replaceMap = new Map(json.data)
  let words = Array.from(replaceMap.keys()).join('|')

  let regex = new RegExp('{{(' + words + ')}}', 'g')
  let match = message.content.match(regex)

  if (match === null) return

  let newContent = message.content
  for (let i = 0; i < match.length; i++) {
    let key = match[i].slice(2, -2)
    let replacer = replaceMap.get(key)
    newContent = newContent.replace('{{' + key + '}}', replacer, 'g')
  }

  message.edit(newContent)
}

module.exports.run = function (message) {
  message.delete()
  let args = message.content.split(' ')
  if (message.content.indexOf(' ') >= 0) {
    let action = args[1] !== undefined ? args[1] : null
    let word = args[2] !== undefined ? args[2].toLowerCase() : null
    let replacer = args[3] !== undefined ? args[3] : null

    args = message.content.split(' ')

    let json = jsonfile.readFileSync(replaceFile, {throws: false})
    if (json === null) json = {data: []}

    let reply = `[replace] Word '${word}' `
    if (action === 'add') {
      if (json.data.includes(word) === false) {
        json.data.push([word, replacer, {json: true}])
        reply += `was added. You can use {{${word}}} to add ${replacer} in messages.`
      } else {
        reply += `is already in the list.`
      }
    } else if (action === 'remove') {
      let data = new Map(json.data)

      if (data.has(word) === false) {
        reply += `isn't on the list.`
      } else {
        data.delete(word)
        json.data = Array.from(data)
        reply += `was removed from the list.`
      }
    } else if (action === 'list') {
      let data = new Map(json.data)
      let embed = new RichEmbed()
        .setTitle('List of Replaceable text')
        .setColor('red')

      for (var v of data) {
        embed.addField(v[0], v[1], true)
      }

      message.channel.send({embed: embed}).catch(err => console.error(err))
      return // special case
    } else {
      reply = `[replace] Available actions are 'add <word> <replacer>' and 'remove <word>' and 'list'`
    }

    jsonfile.writeFileSync(replaceFile, json)
    message.channel.send('`' + reply + '`')
  }
}
