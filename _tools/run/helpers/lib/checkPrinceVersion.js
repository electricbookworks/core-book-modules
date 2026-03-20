const prince = require('prince')
const which = require('which')
const childProcess = require('child_process')

// Check Prince version
function checkPrinceVersion () {
  return new Promise(function (resolve, reject) {
    // Get globally installed Prince version, if any
    const installedPrince = function () {
      return new Promise(function (resolve, reject) {
        // Check local node_modules for Prince binary ...
        if (prince().config.binary.includes('node_modules')) {
          childProcess.execFile(prince().config.binary, ['--version'], function (error, stdout, stderr) {
            if (error !== null) {
              console.log('Could not get Prince version:\n')
              reject(error)
              return
            }
            const m = stdout.match(/^Prince\s+(\d+(?:\.\d+)?)(\s*\w*\s*Books)*/)
            if (!(m !== null && typeof m[1] !== 'undefined')) {
              error = 'Prince version check returned unexpected output:\n' + stdout + stderr
              reject(error)
              return
            }
            let version
            if (m[2] && m[2].includes('Books')) {
              version = 'books-' + m[1]
            } else {
              version = m[1]
            }
            resolve(version)
          })
        } else {
          // ... or else check the global PATH
          const binaries = ['prince', 'prince-books']
          let binaryPath = null
          binaries.forEach(function (binary) {
            which(binary, function (error, path) {
              if (!error) {
                binaryPath = path
              }
            })
          })
          if (!binaryPath) {
            reject(new Error('Prince binary not found in global PATH'))
          } else {
            childProcess.execFile(binaryPath, ['--version'], function (error, stdout, stderr) {
              if (error) {
                console.log('Could not get Prince version:\n')
                reject(error)
                return
              }
              const m = stdout.match(/^Prince\s+(\d+(?:\.\d+)?)/)
              if (!(m !== null && typeof m[1] !== 'undefined')) {
                error = 'Prince version check returned unexpected output:\n' + stdout + stderr
                reject(error)
                return
              }
              resolve(m[1])
            })
          }
        }
      })
    }

    // Check global Prince version vs version defined in package.json,
    // and return the relevant version string.
    installedPrince().then(function (installedVersion) {
      const packageJSON = require(process.cwd() + '/package.json')

      let preferredPrinceVersion

      if (packageJSON.prince && packageJSON.prince.version) {
        preferredPrinceVersion = packageJSON.prince.version

        if (installedVersion !== preferredPrinceVersion) {
          console.log('\nWARNING: your installed Prince version is ' + installedVersion +
                          ' but your project requires ' + preferredPrinceVersion + '\n' +
                          'You should delete node_modules/prince and run: npm install\n')
        } else {
          console.log('Prince version matches preferred version in package.json.')
        }
      }

      // Return the preferred Prince version if there is one,
      // otherwise return the installed version
      let result
      if (preferredPrinceVersion) {
        result = preferredPrinceVersion
      } else if (installedVersion) {
        result = installedVersion
      } else {
        result = undefined
      }
      resolve(result)
    }, function (error) {
      reject(error)
    })
  })
}

module.exports = checkPrinceVersion
