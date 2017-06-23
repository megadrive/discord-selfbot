let gulp = require('gulp')
let standard = require('standard')
let got = require('got')
let fs = require('fs')
const chalk = require('chalk')

gulp.task('lint', function () {
  let opts = {
    ignore: ['dist/*']
  }

  function cb (err, results) {
    if (err) throw new Error(err)

    results.results.forEach(function (r) {
      if (r.errorCount > 0 || r.warningCount > 0) {
        r.messages.forEach(function (m) {
          console.warn(`[standard] ${r.filePath} [${m.line}:${m.column}] ${m.ruleId} - ${m.message}`)
        })
      }
    })
  }

  standard.lintFiles('*.js', opts, cb)
  standard.lintFiles('commands/*.js', opts, cb)
})

gulp.task('getEmoteJSONs', function () {
  let ffzGlobalUrl = 'https://twitchemotes.com/api_cache/v2/global.json'
  let bttvUrl = 'https://api.betterttv.net/emotes'

  got.stream(ffzGlobalUrl).pipe(fs.createWriteStream('./db/twitch_global.json'))
  got.stream(bttvUrl).pipe(fs.createWriteStream('./db/bttv.json'))
})

gulp.task('checkCommands', function () {
  let commands = require('fs').readdirSync('./commands')
  let errors = []
  let warns = []
  for (let i = 0; i < commands.length; i++) {
    let cmd = require(`./commands/${commands[i]}`)
    if (typeof cmd.help !== 'function' || cmd.help === undefined) errors.push(`No help function for ${commands[i]}`)
    if (typeof cmd.run !== 'function' || cmd.run === undefined) errors.push(`No run function for ${commands[i]}`)
    if (typeof cmd.module !== 'function' || cmd.module === undefined) warns.push(`No module function for ${commands[i]}`)
  }

  if (warns.length) {
    console.warn(`${chalk.yellow(warns.length, 'warnings:')}\n  ${warns.join('\n  ')}`)
  }

  if (errors.length) {
    console.error(`${chalk.red(errors.length, 'errors:')}\n  ${errors.join('\n  ')}`)
  }
})

gulp.task('default', ['lint', 'checkCommands', 'getEmoteJSONs'])
