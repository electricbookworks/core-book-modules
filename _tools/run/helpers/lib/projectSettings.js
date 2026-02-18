const fs = require('fs-extra')
const yaml = require('js-yaml')

// Get project settings from settings.yml
function projectSettings () {
  let settings
  try {
    settings = yaml.load(fs.readFileSync('./_data/settings.yml', 'utf8'))
  } catch (error) {
    console.log(error)
  }
  return settings
}

module.exports = projectSettings
