const fs = require('fs-extra')
const yaml = require('js-yaml')

// Get a list of file paths in the project nav
function filesInProjectNav () {
  return new Promise(function (resolve) {
    const files = []
    const projectNav = yaml.load(fs.readFileSync(process.cwd() + '/_data/nav.yml', 'utf8'))
    if (Object.entries(projectNav)) {
      Object.entries(projectNav).forEach(function (entry) {
        if (entry[1]) {
          entry[1].forEach(function (item) {
            const file = item.file
            files.push(file)
          })
        }
      })
    }
    resolve(files)
  })
}

module.exports = filesInProjectNav
