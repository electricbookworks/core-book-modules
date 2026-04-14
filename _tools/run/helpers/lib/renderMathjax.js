const fsPath = require('path')
const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')
const mathjaxEnabled = require('./mathjaxEnabled.js')
const htmlFilePaths = require('../paths/htmlFilePaths.js')
const pathExists = require('../paths/pathExists.js')

// Processes mathjax in output HTML
async function renderMathjax (argv, options) {
  try {
    if (mathjaxEnabled(argv) || argv.mathjax) {
      console.log('Rendering MathJax...')

      // Get the HTML file(s) to render. If we are merging
      // input files, we only pass the merged file,
      // Unless `--merged false` was passed at the command line,
      // or there is no merged file for some reason.

      // Check if a format-specific merged HTML exists.
      // The filename includes the format so that print-pdf and screen-pdf
      // merged files don't overwrite each other.
      const mergedFilename = 'merged-' + argv.format + '.html'
      let mergedFilePath = fsPath.normalize(process.cwd() +
        '/_site/' + argv.book + '/' + mergedFilename)

      if (argv.language) {
        mergedFilePath = fsPath.normalize(process.cwd() +
        '/_site/' + argv.book + '/' + argv.language + '/' + mergedFilename)
      }

      const mergedFileExists = pathExists(mergedFilePath)

      let inputFiles
      if (options && options.allFiles === true) {
        inputFiles = await htmlFilePaths(argv, null, { allFiles: true })
      } else if (mergedFileExists && argv.merged !== false) {
        inputFiles = [mergedFilePath]
      } else if (['web', 'epub', 'app'].includes(argv.format) ||
                 argv.merged === false) {
        inputFiles = await htmlFilePaths(argv)
      }

      // Get the MathJax script
      const mathJaxScript = process.cwd() +
      '/_tools/run/helpers/mathjax/tex2mml-page.js'

      // Process MathJax
      for (const path of inputFiles) {
        if (pathExists(path)) {
          console.log('Rendering maths in ' + path + ' using script ' + mathJaxScript)
          const mathJaxProcess = spawn(
            'node',
            [mathJaxScript, path, path]
          )
          await logProcess(mathJaxProcess, 'Rendering MathJax')
        }
      }
      return true
    } else {
      return true
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = renderMathjax
