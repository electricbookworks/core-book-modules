const works = require('../paths/works.js')
const translations = require('../paths/translations.js')
const projectSettings = require('./projectSettings.js')
const processComments = require('./processComments.js')

// Manage the rendering of index comments for one or all works
async function renderIndexComments (argv, options) {
  try {
    const allWorks = await works()

    if (projectSettings()['dynamic-indexing'] !== false) {
      console.log('Processing indexing comments ...')

      if (options && options.allFiles === true) {
        allWorks.forEach(async function (work) {
          await processComments(work)

          const languages = await translations(work)

          languages.forEach(async function (language) {
            await processComments(work, language)
          })
        })
      } else {
        await processComments(argv.book, argv.language)
      }
    }
    return true
  } catch (error) {
    return error
  }
}

module.exports = renderIndexComments
