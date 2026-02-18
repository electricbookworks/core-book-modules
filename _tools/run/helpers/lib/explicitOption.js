const options = require('../options.js').options

// Check if a user passed an explicit option in argv
// (i.e. yargs is not just using the default in options.js)
// The 'option' argument takes a string of the option
// name, e.g. 'book' or 'language' or 'format'.
function explicitOption (option) {
  // Default is that option was not passed explicitly
  let optionWasExplicit = false

  // Get all the aliases for this option
  let aliases = [option]
  if (options[option] && options[option].alias) {
    // If the option is a string, add it to the aliases,
    // otherwise it's an array of options to merge
    // with the aliases array (e.g. aliases for '--book').
    if (typeof options[option].alias === 'string') {
      aliases.push(options[option].alias)
    } else {
      aliases = aliases.concat(options[option].alias)
    }
  }

  // Check if any of those aliases were in the args
  aliases.forEach(function (alias) {
    // process.argv includes various strings in an array,
    // including the options we want to examine.
    // Those options have the original leading hyphens
    // as they were passed at the command line.
    // So we create a new array containing only the strings
    // in process.argv that start with hyphens,
    // and then we strip those hyphens.
    const optionsInProcessArgv = []
    process.argv.forEach(function (argument) {
      if (argument.match(/^-+/)) {
        const argumentWithoutHyphens = argument.replace(/^-+/, '')
        optionsInProcessArgv.push(argumentWithoutHyphens)
      }
    })

    // Now, is this alias among the options
    // that were explicitly passed at the command line?
    if (optionsInProcessArgv.includes(alias)) {
      optionWasExplicit = true
    }
  })

  return optionWasExplicit
}

module.exports = explicitOption
