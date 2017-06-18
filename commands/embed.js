'use strict'

let got = require('got')

module.exports = {
  aliases: ['embed'],
  event: 'message'
}

function getUrlFromRedditUrl (redditUrl) {
  let reReddit = new RegExp('(www.)?redd\.?it(.com)?.+')
  let reUrl = new RegExp('<p class="title">.+href="http(.+)" tabindex', 'i')
  let ret = redditUrl

  console.info(reReddit, redditUrl)
  if (redditUrl.match(reReddit)) {
    got(redditUrl)
      .then(function (res) {
        let matched = res.body.match(reUrl)
        console.info('here', matched)
      })
  }
}

module.exports.run = function (message) {
  message.delete()

  let url = null
  if (message.content.indexOf(' ') >= 0) {
    url = message.content.substr(message.content.indexOf(' ') + 1)
    getUrlFromRedditUrl(url)
  }
  message.channel.send({files: [{attachment: url}]})
}


