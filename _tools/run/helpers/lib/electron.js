const fsPath = require('path')
const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Run Electron with args.
// - args is an array of arguments
// - electronWorkingDirectory is the directory in which
//   electron must run, e.g. _site/app
async function electron (args, electronWorkingDirectory) {
  // Create a default/fallback working directory
  if (!electronWorkingDirectory) {
    electronWorkingDirectory = fsPath.normalize(process.cwd() + '/_site/app')
  }

  try {
    console.log('Running electron with ' + JSON.stringify(args) +
      ' from\n' + electronWorkingDirectory)

    const electronProcess = spawn('electron-forge', args, { cwd: electronWorkingDirectory })
    const result = await logProcess(electronProcess, 'Electron')
    return result
  } catch (error) {
    console.log(error)
  }
}

module.exports = electron
