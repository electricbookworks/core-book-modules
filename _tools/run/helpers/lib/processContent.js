const htmlFilePaths = require('../paths/htmlFilePaths.js')
const replaceNamedEntitiesWithNumeric = require('./replaceNamedEntitiesWithNumeric.js')

// Process all HTML content as strings.
// Useful for simple operations where we don't
// want to parse the doc as HTML, because
// rendering it through an AST will break things.
async function processContent (argv) {
  // get files
  const files = await htmlFilePaths(argv)

  // For each one, run processing tasks
  files.forEach(function (file) {
    // Replace unescaped named entities with XML entities
    replaceNamedEntitiesWithNumeric(file)
  })
}

module.exports = processContent
