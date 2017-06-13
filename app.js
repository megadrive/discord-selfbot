'use strict'

let conf = require('./config')
const Discord = require('discord.js')
let bot = new Discord.Client()
bot.commands = {
  message: {}
}

let LogLevel = { verbose: 0, error: 1, warn: 2, info: 3, none: 99 }
let debugLevel = LogLevel.info

let log = {
  info: function (...args) { if (debugLevel <= LogLevel.info) console.info(args) },
  warning: function (...args) { if (debugLevel <= LogLevel.warn) console.warn(args) },
  error: function (...args) { if (debugLevel <= LogLevel.error) console.error(args) }
}

function registerCommand (file, module) {
  return new Promise(function (resolve, reject) {
    if (module.aliases === undefined || module.event === undefined || module.run === undefined) {
      reject(new Error(`Module.aliases or Module.run doesn't exist: ${file}`))
    } else {
      for (let a = 0; a < module.aliases.length; a++) {
        if (module.run && typeof module.run === 'function') {
          bot.commands[module.event][module.aliases[a]] = module.run
        } else {
          reject(new Error(`Module.run is not a function: ${file}`))
        }
      }

      resolve(`Successfully added module ${file} with aliases: ${module.aliases} on event ${module.event}`)
    }
  })
}

// register commands
let _cmds = require('fs').readdirSync('./commands')
for (let i = 0; i < _cmds.length; i++) {
  let cmd = require(`./commands/${_cmds[i]}`)
  registerCommand(_cmds[i], cmd)
    .then(function (f) {
      log.info(`Registered command ${f}`)
    })
    .catch(function (err) {
      log.error(err)
    })
}

bot.on('ready', () => {
  console.info('Selfbot ready with these settings:', conf)
})

// Handle commands
bot.on('message', function (message) {
  if (message.author.id === conf['owner-id'] && message.content.startsWith(conf.prefix)) {
    let trigger = message.content.split(' ')[0].substr(1)
    let func = bot.commands['message'][trigger]
    if (typeof func === 'function' && func !== undefined) {
      func(message)
    }
  }
})

bot.login(conf.token)
