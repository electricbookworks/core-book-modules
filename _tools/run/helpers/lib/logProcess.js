// Output spawned-process data to console
function logProcess (process, processName) {
  return new Promise(function (resolve, reject) {
    processName = processName || 'Process: '

    // Listen to stdout
    process.stdout.on('data', function (data) {
      console.log(processName + ': ' + data)
    })

    // Listen to stderr
    process.stderr.on('data', function (data) {
      console.log(processName + ': ' + data)
    })

    // Listen for an error event:
    process.on('error', function (error) {
      // console.log(processName + ' errored with: ' + error.message)
      reject(error.message)
    })

    // Listen for an exit event:
    process.on('close', function (exitCode) {
      // console.log(processName + ' exited with: ' + exitCode)
      if (exitCode !== 0) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = logProcess
