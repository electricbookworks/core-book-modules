const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Run HTML transformations on elements in pdf
async function pdfHTMLTransformations (argv) {
  console.log('Running HTML transformations ...')

  try {
    let pdfHTMLTransformationsProcess
    if (argv.language) {
      pdfHTMLTransformationsProcess = spawn(
        'gulp',
        ['runPDFTransformations',
          '--book', argv.book,
          '--language', argv.language,
          '--format', argv.format,
          '--merged', argv.merged]
      )
    } else {
      pdfHTMLTransformationsProcess = spawn(
        'gulp',
        ['runPDFTransformations',
          '--book', argv.book,
          '--format', argv.format,
          '--merged', argv.merged]
      )
    }
    await logProcess(pdfHTMLTransformationsProcess, 'Run HTML transformations')
    return true
  } catch (error) {
    console.log(error)
  }
}

module.exports = pdfHTMLTransformations
