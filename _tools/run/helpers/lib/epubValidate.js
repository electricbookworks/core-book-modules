const fsPath = require('path')
const epubchecker = require('epubchecker')
const openOutputFile = require('./openOutputFile.js')

// Check epub.
// Done as async so that we can await epubchecker
// and output its report to the console.
async function epubValidate (pathToEpubOrArgv) {
  // Get path to epub from argument
  let pathToEpub
  if (pathToEpubOrArgv.book) {
    pathToEpub = process.cwd() +
      '/_output/' +
      pathToEpubOrArgv.book + '.epub'
  } else {
    pathToEpub = pathToEpubOrArgv
  }

  pathToEpub = fsPath.normalize(pathToEpub)
  const epubFilename = fsPath.basename(pathToEpub)
  const epubcheckReportFilePath = fsPath.normalize(process.cwd() +
            '/_output/' +
            epubFilename +
            '--epubcheck.json')

  console.log('Validating ' + epubFilename + '...')

  const report = await epubchecker(pathToEpub, {
    includeWarnings: true,
    includeNotices: true,
    output: epubcheckReportFilePath
  })

  console.log('Fatal errors: ' + report.checker.nError + '\n' +
            'Epub errors: ' + report.checker.nError + '\n' +
            'Epub warnings: ' + report.checker.nWarning + '\n')
  if (report.messages.length > 0) {
    console.log(report.messages)
    console.log('Your epub has issues. Opening report...')
    openOutputFile(epubcheckReportFilePath)
    return true
  } else {
    console.log('Epub is valid :-)')
    return true
  }
}

module.exports = epubValidate
