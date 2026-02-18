const fsPath = require('path')
const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Run Cordova with args.
// - args is an array of arguments
// - cordovaWorkingDirectory is the directory in which
//   cordova must run, e.g. _site/app
async function cordova (args, cordovaWorkingDirectory) {
  // Create a default/fallback working directory
  if (!cordovaWorkingDirectory) {
    cordovaWorkingDirectory = fsPath.normalize(process.cwd() + '/_site/app')
  }

  try {
    console.log('Running Cordova with ' + JSON.stringify(args) +
      ' from\n' + cordovaWorkingDirectory)

    const cordovaProcess = spawn('cordova', args, { cwd: cordovaWorkingDirectory })
    const result = await logProcess(cordovaProcess, 'Cordova')
    return result
  } catch (error) {
    console.log(error)
  }
}

module.exports = cordova
