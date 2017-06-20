'use strict'

let got = require('got')
let fs = require('fs')
let conf = require('../config')

module.exports = {
  aliases: ['gif', 'giphy'],
  event: 'message'
}

module.exports.help = function () {
  return {
    description: `Gets the first GIF found through Tenor.com's API based on the tags given and sends as a file attachment.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]}`]
  }
}

module.exports.run = function (message) {
  message.delete()

  let phrase = message.content.substr(message.content.indexOf(' ') + 1)
  for (let i = 0; i < module.exports.aliases.length; i++) {
    if (phrase.startsWith(module.exports.aliases[i], 1)) {
      message.channel.send('[gif] Need search terms.')
        .then(msg => msg.delete(5000))
      return
    }
  }

  if (phrase !== undefined || !phrase.includes(module.exports.aliases)) {
    got(`https://api.tenor.com/v1/search?tag=${phrase}&key=LIVDSRZULELA&limit=1`)
      .then(function (res) {
        res.body = JSON.parse(res.body)
        if (res.body.results) {
          let gif = res.body.results[0].media[0].gif.url
          let path = `./temp/${res.body.results[0].id}.gif`

          got.stream(gif).pipe(fs.createWriteStream(path))
            .on('close', function () {
              message.channel.send({files: [{attachment: path}]})
                .then(function () {
                  fs.unlinkSync(path)
                })
            })
        }
      })
  }
}
