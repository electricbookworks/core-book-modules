const fs = require('fs-extra')
const fsPath = require('path')
const fsPromises = require('fs/promises')

// Assemble app files
async function assembleApp () {
  // Move everything in the _site folder to _site/app
  // except, of course, _site/app itself.

  const source = fsPath.normalize(process.cwd() + '/_site')
  const destination = fsPath.normalize(process.cwd() + '/_site/app/www')

  const pathsInSource = await fsPromises.readdir(source, { withFileTypes: true })

  pathsInSource.forEach(function (entry) {
    if (entry.name !== 'app') {
      fs.moveSync(source + fsPath.sep + entry.name, destination + fsPath.sep + entry.name)
    }
  })
}

module.exports = assembleApp
