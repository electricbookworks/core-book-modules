const fs = require('fs-extra')
const fsPath = require('path')

// Get a list of file paths in _docs
async function filesInDocs () {
  const docsFiles = await fs.readdir(fsPath.normalize(process.cwd() + '/_docs'), { recursive: true })

  return new Promise(function (resolve) {
    const files = []
    docsFiles.forEach(function (file) {
      if (file.match(/\.md$/g)) {
        let fileBasename = 'docs/' + file.replace(/\.md$/g, '')

        // Replace backslashes with forward slashes for Windows
        fileBasename = fileBasename.replace(/\\/g, '/')
        files.push(fileBasename)
      }
    })
    resolve(files)
  })
}

module.exports = filesInDocs
