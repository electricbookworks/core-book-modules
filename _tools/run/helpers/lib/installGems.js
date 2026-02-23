const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Install Ruby dependencies
function installGems () {
  console.log(
    'Running Bundler to install Ruby gem dependencies...\n' +
        'If you get errors, check that Bundler is installed \n' +
        'and up to date (https://bundler.io). \n'
  )
  const bundleProcess = spawn(
    'bundle',
    ['install']
  )
  logProcess(bundleProcess, 'Installing Ruby gems')
}

module.exports = installGems
