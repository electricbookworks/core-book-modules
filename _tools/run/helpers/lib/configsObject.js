const fsPath = require('path')
const yaml = require('js-yaml')
const concatenate = require('concatenate')
const configString = require('./configString.js')

// Jekyll configs as JS object. Note:
// This includes duplicate keys where concatenated
// config files have the same keys. That's not
// valid YAML, but it's okay in JSON, where
// the last value overrides earlier ones.
function configsObject (argv) {
  // Create an array of paths to the config files
  const configFiles = configString(argv).split(',')
  configFiles.map(function (file) {
    return fsPath.normalize(file)
  })

  // Combine them and load them as a JSON array
  const concatenated = concatenate.sync(configFiles)
  const json = yaml.loadAll(concatenated, { json: true })

  // Return the first object of the first object of the array
  return json[0]
}

module.exports = configsObject
