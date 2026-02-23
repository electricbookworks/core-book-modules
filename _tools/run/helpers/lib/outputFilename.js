// Returns a filename for the output file
function outputFilename (argv) {
  let filename
  let fileExtension = '.pdf'
  if (argv.format === 'epub') {
    fileExtension = '.epub'
  }

  if (argv.language) {
    filename = argv.book + '-' + argv.language + '-' + argv.format + fileExtension
  } else {
    filename = argv.book + '-' + argv.format + fileExtension
  }

  return filename
}

module.exports = outputFilename
