let gulp = require('gulp')
let standard = require('standard')
let got = require('got')
let fs = require('fs')

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

gulp.task('default', ['lint', 'getEmoteJSONs'])
