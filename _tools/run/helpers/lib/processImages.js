const spawn = require('cross-spawn')
const logProcess = require('./logProcess.js')

// Processes images with gulp if -t images
async function processImages (argv) {
  try {
    const gulpProcess = spawn(
      'gulp',
      ['--book', argv.book, '--language', argv.language]
    )
    await logProcess(gulpProcess, 'Processing images')
  } catch (error) {
    console.log(error)
  }
}

module.exports = processImages
