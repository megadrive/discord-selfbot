'use strict'

let got = require('got')
let conf = require('../config')

module.exports = {
  aliases: ['weather', 'w'],
  event: 'message'
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Gets weather for the supplied area. Depends on config.darksky_apikey and conf.google_apikey being present and active.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} [location|long/lat coords]`]
  }
}

let map = `https://maps.googleapis.com/maps/api/geocode/json?key=${conf.google_apikey}&address=`
let promo = 'Powered by Dark Sky (https://darksky.net/poweredby/)'
let darksky = `https://api.darksky.net/forecast/${conf.darksky_apikey}/`

module.exports.run = function (message) {
  message.delete()

  if (conf.google_apikey === undefined || conf.google_apikey.length === 0 ||
        conf.darksky_apikey === undefined || conf.darksky_apikey.length === 0) {
    console.error('[weather] config.json google_apikey or darksky_apikey is not valid or doesn\'t exist')
    return
  }

  let address = message.content.substr(message.content.indexOf(' ') + 1)

  got(map + address, {json: true})
    .then(function (res) {
      if (res.body.results.length === 0) {
        message.channel.send('No results. ¯\\_(ツ)_/¯')
        return
      }

      let formatted = res.body.results[0].formatted_address
      let geo = {
        lat: res.body.results[0].geometry.location.lat,
        lng: res.body.results[0].geometry.location.lng
      }

      darksky += encodeURIComponent(geo.lat) + ',' + encodeURIComponent(geo.lng) + '?exclude=minutely,hourly,daily,alerts&units=auto'
      got(darksky, {json: true})
        .then(function (res) {
          let currently = res.body.currently
          let unit = res.body.flags.units === 'si' ? 'c' : 'f'
          let msg = `Current weather for ${formatted}: ${currently.summary} ${currently.temperature}°${unit}. ${promo}`
          message.channel.send(msg)
        })
        .catch(function (err) {
          console.error('darksky error:', err)
        })
    })
}
