const fsPromises = require('fs/promises')
const works = require('../paths/works.js')
const configsObject = require('./configsObject.js')
const explicitOption = require('./explicitOption.js')

// Config to exclude unnecessary books from Jekyll build
async function extraExcludesConfig (argv) {
  // Default is an empty config file, for no excludes.
  // Create it and/or make it an empty file.
  const pathToTempExcludesConfig = '_output/.temp/_config.excludes.yml'
  await fsPromises.mkdir('_output/.temp', { recursive: true })
  await fsPromises.writeFile(pathToTempExcludesConfig, '')

  // If we're outputting a particular book/work,
  // and the user explicitly asked for that book
  // (as opposed to omitting --book and using defaults),
  // exclude any other works in this project
  // by adding them to a Jekyll `exclude` config.
  if (argv && argv.book && explicitOption('book')) {
    // Get all the works but leave out the argv.book we want
    const allWorks = await works()
    const worksToExclude = allWorks.filter(function (work) {
      return work !== argv.book
    })

    // Get the current excludes list
    const excludes = configsObject(argv).exclude

    // Add the works we're not outputting to it
    const newExcludes = excludes.concat(worksToExclude)

    // That's only the list of values. To create a valid
    // key:value property, we need the `exclude:` key.
    const excludesProperty = {
      exclude: newExcludes
    }

    // Write the new excludes config as a YAML file
    const yaml = require('js-yaml')
    const excludesYAML = yaml.dump(excludesProperty)
    await fsPromises.writeFile(pathToTempExcludesConfig, excludesYAML)
  }

  // Return the path to the new excludes config
  return pathToTempExcludesConfig
}

module.exports = extraExcludesConfig
