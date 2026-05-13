const variantSettings = require('../settings/variantSettings.js')

// Returns a filename for the output file
function outputFilename (argv) {
  let filename
  let fileExtension = '.pdf'
  if (argv.format === 'epub') {
    fileExtension = '.epub'
  }

  if (argv.language) {
    filename = argv.book + '-' + argv.language + '-' + argv.format
  } else {
    filename = argv.book + '-' + argv.format
  }

  const variant = variantSettings(argv)
  if (variant.active) {
    filename += '--' + variant.active
  }

  filename += fileExtension

  return filename
}

module.exports = outputFilename
