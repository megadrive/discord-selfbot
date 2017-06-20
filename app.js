'use strict'

let fs = require('fs')
let conf = require('./config')
const Discord = require('discord.js')
let bot = new Discord.Client()
bot.commands = {
  message: {}, help: {}, raw: {}
}
bot.modules = {
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
          // Add the whole module so we can access it later if necessary.
          bot.commands['raw'][module.aliases[a]] = module
          // Add the run function
          bot.commands[module.event][module.aliases[a]] = module.run

          // Add help documentation if it exists
          if (module.help && typeof module.help === 'function') {
            bot.commands['help'][module.aliases[a]] = module.help
          }
        } else {
          reject(new Error(`Module.run is not a function: ${file}`))
        }
      }

      // Add a module if it exists. These run on every `event`, no command call necessary.
      if (module.module && typeof module.module === 'function') {
        bot.modules[module.event][module.aliases[0]] = module.module
      }

      resolve(`Successfully added module ${file} with aliases: ${module.aliases} on event ${module.event}`)
    }
  })
}

// Create temp folder if it doesn't exist
if (fs.existsSync('./temp') === false) {
  fs.mkdir('./temp', function (err) {
    if (err) {
      console.error('Temp folder could not be created. Do you have required permissions to create files/folders?')
      throw new Error(err)
    }
    console.info('temp/ folder doesn\'t exist, creating..')
  })
}

// register commands
let _cmds = require('fs').readdirSync('./commands')
for (let i = 0; i < _cmds.length; i++) {
  let cmd = require(`./commands/${_cmds[i]}`)
  registerCommand(_cmds[i], cmd)
    .then(function (f) {
      log.info(`Registered command -- ${f}`)
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
  if (message.author.id === conf['owner-id']) {
    if (message.content.startsWith(conf.prefix)) {
      let trigger = message.content.split(' ')[0].substr(1)
      let runFunc = bot.commands['message'][trigger]
      let helpFunc = bot.commands['help'][trigger]
      if (message.content.includes('--help')) {
        let helpData = helpFunc()
        let template = 'DESCRIPTION\n\t{description}\n\nUSAGE\n\t{usage}\n\nALIASES\n\t{aliases}'
          .replace('{description}', helpData.description, 'g')
          .replace('{usage}', helpData.usage.join('\n\t'), 'g')
          .replace('{aliases}', bot.commands.raw[trigger].aliases.join('\n\t'), 'g')

        message.channel.send('```\n' + template + '\n```')
      } else if (typeof runFunc === 'function' && runFunc !== undefined) {
        runFunc(message)
      }
    } else {
      // run all modules
      let keys = Object.keys(bot.modules['message'])
      for (let i = 0; i < keys.length; i++) {
        bot.modules['message'][keys[i]](message)
      }
    }
  }
})

bot.login(conf.token)
