let gulp = require('gulp')
let standard = require('standard')

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

gulp.task('default', ['lint'])
