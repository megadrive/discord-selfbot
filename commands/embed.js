'use strict'

let got = require('got')

module.exports = {
  aliases: ['embed'],
  event: 'message'
}

function getUrlFromRedditUrl (redditUrl) {
  return new Promise(function (resolve, reject) {
    let reReddit = new RegExp('(www.)?redd.?it(.com)?.+')
    let reTitle = new RegExp('<title>(.+) : .+</title>', 'i')
    let reUrl = new RegExp('data-url="(.+?)"')
    let reShortlink = new RegExp('<link rel="shorturl" href="(https?://redd.it/.+?)"/>')

    if (redditUrl.match(reReddit)) {
      got(redditUrl)
        .then(function (res) {
          let title = reTitle.exec(res.body)
          let url = res.body.match(reUrl)
          let shortlink = res.body.match(reShortlink)
          if (title && url && shortlink) {
            resolve({
              title: title[1],
              url: url[1],
              shortlink: shortlink[1]
            })
          } else {
            reject(new Error('[embed] No URL found in Reddit URL'))
          }
        })
    }
  })
}

module.exports.run = function (message) {
  message.delete()

  let url = null
  if (message.content.indexOf(' ') >= 0) {
    getUrlFromRedditUrl(message.content.split(' ')[1])
      .then(function (data) {
        message.channel.send(`${data.title} -- ${data.shortlink}`, {files: [{attachment: data.url}]})
      })
      .catch(function (err) {
        if (err) console.warn(err)

        url = message.content.substr(message.content.indexOf(' ') + 1)
        message.channel.send({files: [{attachment: url}]})
      })
  }
}
