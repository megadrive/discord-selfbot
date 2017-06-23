# discord-selfbot

<p align="center">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
</p>



## How to run

1. Clone the repo

`$ git clone https://github.com/megadrive/discord-selfbot`

2. Install dependencies

`$ npm install`

3. Create a config file by making a copy of `config.json.example` and rename it to `config.json`. To get your user token, see [Getting Your User Token](GettingYourUserToken.md).
If you want to use the `weather` command, you must obtain both a [Google Maps Geocoding API key](https://developers.google.com/maps/documentation/geocoding/start) and a [Dark Sky API key](https://darksky.net/dev/).
  Without these `weather` will emit a warning on use.

4. Run the bot!

`$ npm start`

5. Running the notifier is fairly simple. Create another Discord account and set it up similarly to how you set up the selfbot, except add the other `token` under `config.notifier-token`. The next step is to run similar to above, except pass the `--notify` flag.

`$ npm start -- --notify`

## Creating your own commands

As of writing, a command has two required exports and two optional exports. An object on the `exports` variable itself, a `help` function and a `run` function. **Always include `'use strict'` to avoid complications.**

`exports` should contain an object with an `aliases` array and `event` which is a string.

`aliases` is an array of anything that you want this to fire from. So, given the default prefix of `_`, calling `_triggers`, `_to_` or `_fire` will cause this command to run. One caveat is that if you double-up on command triggers, the **later loaded** will overwrite the **older**. Generally speaking, if your command file starts with 'a' and your 'z' function has an alias of 'a', calling `_a` will run the command 'z'.

`event` is a string that you will nearly definitely not need to change. If you do, you will need to create a new `bot.on()` function in `app.js`. Open an issue if you need it.

```js
module.exports = {
  aliases: ['triggers', 'to', 'fire'],
  event: 'message'
}
```

This next function is called when a command is loaded. This is separated into its own function so that when using `gulp` for testing it doesn't initiate certain things that aren't required for testing. You can use this to initiate variables, do login functions for certain APIs that require login or what have you.
```js
module.exports.init = function () {
  // init stuff
}
```

**Required** This next block is the help function that is used when calling a function with the --help flag. `usage` is an array, add another if your command has more than one usage. See [`replace.js`](commands/replace.js) for an example.
```js
module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Your command's description.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} your usage information.`]
  }
}
```

*Optional* Use this if you need to subscribe to the event every time it fires. This is optional.
```js
module.exports.module = function (message) {
  /*
    Your code to enact on every discord.js message event
    Useful if you want to poll for a specific word that
    is said or if you want to count words or something.
  */
}
```

**Required** This is the crux of your command. Do whatever you need to here.
```js
module.exports.run = function (message) {
  // your code to enact here
}
```

Full example:
```js
'use strict'

module.exports = {
  aliases: ['triggers', 'to', 'fire'],
  event: 'message'
}

module.exports.module = function (message) {
  /*
    Your code to enact on every discord.js message event
    Useful if you want to poll for a specific word that
    is said or if you want to count words or something.
  */
}

module.exports.help = function () {
  let conf = require('../config')
  return {
    description: `Your command's description.`,
    usage: [`${conf.prefix}${module.exports.aliases[0]} your usage information.`]
  }
}

module.exports.run = function (message) {
  // your code to enact here
}
```