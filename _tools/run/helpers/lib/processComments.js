const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Process index comments as targets in output HTML
async function processComments (work, language) {
  try {
    let indexCommentsProcess
    if (language) {
      indexCommentsProcess = spawn(
        'gulp',
        ['renderIndexCommentsAsTargets',
          '--book', work,
          '--language', language]
      )
    } else {
      indexCommentsProcess = spawn(
        'gulp',
        ['renderIndexCommentsAsTargets', '--book', work]
      )
    }
    await logProcess(indexCommentsProcess, 'Index comments')
    return true
  } catch (error) {
    console.log(error)
  }
}

module.exports = processComments
