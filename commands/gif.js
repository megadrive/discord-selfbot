'use strict'

let got = require('got')
let fs = require('fs')

module.exports = {
  aliases: ['gif', 'giphy'],
  event: 'message'
}

module.exports.run = function (message) {
  message.delete()

  let phrase = message.content.substr(message.content.indexOf(' ') + 1)

  if (phrase !== undefined) {
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
