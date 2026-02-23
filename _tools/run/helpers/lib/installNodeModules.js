const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Install Node dependencies
function installNodeModules () {
  console.log(
    'Running npm to install Node modules...\n' +
        'If you get errors, check that Node.js is installed \n' +
        'and up to date (https://nodejs.org). \n'
  )
  const npmProcess = spawn(
    'npm',
    ['install']
  )
  logProcess(npmProcess, 'Installing Node modules')
}

module.exports = installNodeModules
