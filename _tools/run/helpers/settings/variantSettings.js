// Lint with JS Standard

// Import Node modules
const fs = require('fs-extra')
const fsPath = require('path')
const yaml = require('js-yaml')
const projectSettings = require('./projectSettings.js')

// Get variant settings
function variantSettings (argv) {
  let format = 'web' // fallback
  if (argv && argv.format) {
    format = argv.format
  }
  // Create an object for default settings
  const settings = {
    active: false,
    stylesheet: format + '.css'
  }

  // Check the project settings for an active variant.
  if (projectSettings() &&
      projectSettings()['active-variant'] &&
      projectSettings()['active-variant'] !== '') {
    settings.active = projectSettings()['active-variant']
  }

  // Check config files passed via argv.configs for an active variant.
  // A variant set in a config file takes priority over settings.yml,
  // matching the behaviour in _includes/metadata.
  if (argv && argv.configs) {
    const configPath = fsPath.normalize(
      process.cwd() + '/_configs/' +
      argv.configs.replace(/'/g, '').replace(/"/g, '')
    )
    try {
      const configContents = fs.readFileSync(configPath, 'utf8')
      const configData = yaml.load(configContents)
      if (configData && configData['active-variant'] &&
          configData['active-variant'] !== '') {
        settings.active = configData['active-variant']
      }
    } catch (error) {
      // Config file not found or unreadable; fall back to settings.yml
    }
  }

  // Check for the variant-specific stylesheet we should use.
  if (settings.active && projectSettings().variants) {
    // Loop through the variants in project settings
    // to find the active variant. Then return
    // the format-specific stylesheet name there.
    projectSettings().variants.forEach(function (variantEntry) {
      if (variantEntry.variant === settings.active &&
          variantEntry[argv.format + '-stylesheet'] &&
          variantEntry[argv.format + '-stylesheet'] !== '') {
        settings.stylesheet = variantEntry[argv.format + '-stylesheet']
      }
    })
  }

  return settings
}

module.exports = variantSettings
