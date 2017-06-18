'use strict'

let convert = require('convert-units')

module.exports = {
  aliases: ['convert'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()
  let args = message.content.split(' ')
  let unit = args[1] !== undefined ? args[1] : null
  let measure1 = args[2].toLowerCase() !== undefined ? args[2] : null
  let measure2 = args[4].toLowerCase() !== undefined ? args[4] : null

  if (args[3].toLowerCase() !== 'to') return

  let result
  try {
    result = convert(unit).from(measure1).to(measure2)
  } catch (err) {
    console.error(err)
  }

  let question = args.slice(1).join(' ')
  if (result !== undefined) {
    message.channel.send(`\`[convert] ${question} = ${result.toFixed(2)} ${measure2}\``)
  } else {
    message.channel.send(`\`[convert] Not possible.\``)
  }
}
