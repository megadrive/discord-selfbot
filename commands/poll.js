'use strict'

let got = require('got')

// https://github.com/strawpoll/strawpoll/issues/74

module.exports = {
  aliases: ['poll'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Creates a Strawpoll. First argument is the title, follows by as many options as you need. Arguments are separated by '|'.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} Strawpoll title! | Option 1 | Option 2 | Option 3`]
  }
}

// _poll This is my question | This is an answer | this is an answer too
module.exports.run = function (message) {
  message.delete()
  let args = message.content.split('|')
  args[0] = args[0].slice(args[0].indexOf(' ') + 1)

  let title = args[0].trim()
  let options = args.slice(1)
  for (let i = 0; i < options.length; i++) {
    options[i] = options[i].trim()
  }

  got('https://www.strawpoll.me/api/v2/polls', {
    method: 'POST',
    json: true,
    body: {
      title: title,
      options: options
    }
  })
    .then(function (res) {
      message.channel.send(`${title} https://www.strawpoll.me/${res.body.id}`)
    })
}
