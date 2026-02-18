const fs = require('fs-extra')
const fsPath = require('path')
const convertToMarkdown = require('./convertToMarkdown.js')

// Copy a book to create a new one
async function newBook (argv) {
  let sourceName = 'book'
  if (argv.book) {
    sourceName = argv.book
  }

  let destinationName = 'new'
  if (argv.name) {
    destinationName = argv.name
  }

  const contentSource = fsPath.normalize(process.cwd() + '/' + sourceName)
  const dataSource = fsPath.normalize(process.cwd() + '/_data/works/' + sourceName)
  const contentDestination = fsPath.normalize(process.cwd() + '/' + destinationName)
  const dataDestination = fsPath.normalize(process.cwd() + '/_data/works/' + destinationName)

  // Copy content folder
  try {
    fs.copySync(contentSource, contentDestination)
  } catch (error) {
    console.log(error)
  }

  // Copy _data/works folder
  try {
    fs.copySync(dataSource, dataDestination)
  } catch (error) {
    console.log(error)
  }

  if (argv.source) {
    await convertToMarkdown(argv)
  }
}

module.exports = newBook
