const fsPath = require('path')
const open = require('open')
const outputFilename = require('./outputFilename.js')

// Opens the output file. Accepts argv or a filepath.
function openOutputFile (argvOrFilePath) {
  // If no filepath is provided, assume we're opening
  // the book file we've just generated.
  let filePath
  if (argvOrFilePath.book) {
    filePath = fsPath.normalize(process.cwd() +
                '/_output/' +
                outputFilename(argvOrFilePath))
    console.log('Your ' + argvOrFilePath.format + ' is at ' + filePath)
  } else {
    filePath = argvOrFilePath
  }
  console.log('Opening ' + filePath)
  open(fsPath.normalize(filePath))
}

module.exports = openOutputFile
