'use strict'

let jsonfile = require('jsonfile')

module.exports = {
  aliases: ['quote', 'q'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Adds or gets a quote by a member. Quotes are confined to the server they were made on. Must use an @mention. If you don't have permissions for Embeds, will fall back to plaintext.`,
    usage: [
      `${conf.prefix}${module.exports.aliases[0]} [@mention] [the quote]`,
      `${conf.prefix}${module.exports.aliases[0]} get [@mention]`
    ]
  }
}

module.exports.run = function (message) {
  message.delete()

  let quotesFile = './db/quotes.json'
  let json = jsonfile.readFileSync(quotesFile, {throws: false})
  if (json === null) json = {data: []}

  let content = message.content.substr(message.content.indexOf(' ', message.content.indexOf(' ') + 1) + 1).trim()

  // Detect if we just want to list a quote
  let action = message.content.split(' ')
  if (action[1] !== undefined && action[1].toLowerCase().trim() === 'get') {
    let mentionsArr = message.mentions.members.array()
    let mentionedUser = mentionsArr.length >= 0 ? mentionsArr[0] : null
    let searchString = action[3] !== undefined ? action.splice(3).join(' ') : null
    if (mentionedUser) {
      let quote = json.data.filter(function (el) {
        let ifSearchString = searchString !== null ? el.content.includes(searchString) : true // true so it is ignored
        return el.guildId === message.guild.id && el.member.id === mentionedUser.id && ifSearchString
      })

      let RichEmbed = require('discord.js').RichEmbed
      let embed = new RichEmbed()
        .setAuthor('AND I QUOTE ' + mentionedUser.displayName)
        .setTimestamp(quote[0].createdAt)
        .setDescription(quote[0].content)
      message.channel.send({embed: embed})
        .catch(function (err) {
          // No permissions? No problem!
          if (err.code === 50013) { // missing permissions
            let msg = `AND I QUOTE ${mentionedUser} @ ${quote[0].createdAt}: ${quote[0].content}`
            message.channel.send(msg)
              .catch(function (err) {
                console.err(err)
              })
          }
        })
    }
  } else {
    // Add a quote
    if (message.mentions.members.length === 0) {
      console.warn(`[quote] Nobody mentioned to quote.`)
    } else if (message.mentions.everyone) {
      console.warn(`[quote] Can't quote @everyone or @here.`)
    } else if (content === null || content.length === 0) {
      console.warn(`[quote] Nothing to quote.`)
    } else {
      let member = message.mentions.members.array()[0]
      let quoteData = {
        guildId: message.guild.id,
        createdAt: message.createdAt,
        content: content,
        member: {
          id: member.id,
          displayName: member.displayName,
          nickname: member.nickname
        }
      }
      json.data.push(quoteData)

      jsonfile.writeFile(quotesFile, json, function (err, obj) {
        if (err || obj === null) {
          console.warn(`[quote] Error writing JSON: ${err}`)
        } else {
          message.channel.send(`[quotes] Added quote by ${member}: "${content}"`)
        }
      })
    }
  }
}
