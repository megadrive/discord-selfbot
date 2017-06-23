'use strict'

const argv = require('minimist')(process.argv.slice(2))
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
      // If a command/module has a 'depends-on-flag' array, only add if the bot is launched with that flag.
      if ((module['depends-on-flag'] && argv[module['depends-on-flag']]) || module['depends-on-flag'] === undefined) {
        for (let a = 0; a < module.aliases.length; a++) {
          if (module.run && typeof module.run === 'function') {
            // Add the whole module so we can access it later if necessary.
            bot.commands['raw'][module.aliases[a]] = module
            // Add the run function
            bot.commands[module.event][module.aliases[a]] = module.run

            // If there is an init function, init.
            if (module.init && typeof module.init === 'function') {
              module.init()
            }

            // Add help documentation if it exists
            if (module.help && typeof module.help === 'function') {
              bot.commands['help'][module.aliases[a]] = module.help
            }
          } else {
            reject(new Error(`Module.run is not a function: ${file}`))
          }
        }
      } else {
        reject(new Error(`Flag ${module['depends-on-flag']} not set for ${file} loading, ignoring.`))
      }

      // Add a module if it exists. These run on every `event`, no command call necessary.
      if (module.module && typeof module.module === 'function') {
        bot.modules[module.event][module.aliases[0]] = module.module
      }

      resolve(`Successfully added command ${file} with aliases: ${module.aliases} on event ${module.event}`)
    }
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
        // Check if usage is an array, if not just use whatever is there, which should be a string.
        let usage = Array.isArray(helpData.usage) ? helpData.usage.join('\n\t') : helpData.usage
        let template = 'DESCRIPTION\n\t{description}\n\nUSAGE\n\t{usage}\n\nALIASES\n\t{aliases}'
          .replace('{description}', helpData.description, 'g')
          .replace('{usage}', usage, 'g')
          .replace('{aliases}', bot.commands.raw[trigger].aliases.join('\n\t'), 'g')

        message.channel.send('```\n' + template + '\n```')
      } else if (typeof runFunc === 'function' && runFunc !== undefined) {
        runFunc(message)
      }
    }
  }

  // run all modules
  let keys = Object.keys(bot.modules['message'])
  for (let i = 0; i < keys.length; i++) {
    bot.modules['message'][keys[i]](message)
  }
})

bot.login(conf.token)

process.on('unhandledRejection', r => {
  console.error('Please open an issue on GitHub with this text if you see this event.', r)
})
