const fs = require('fs-extra')
const fsPath = require('path')
const fsPromises = require('fs/promises')
const slugify = require('../../../gulp/helpers/utilities.js').ebSlugify
const pathExists = require('../paths/pathExists.js')
const explicitOption = require('./explicitOption.js')

// Generate a copy-pasteable file list in a file
async function outputFileList (filesMetadata) {
  let list = ''
  filesMetadata.forEach(function (file) {
    list += '- ' + file.name + '\n'
  })

  const listFilePath = fsPath.normalize(process.cwd() +
    '/_output/' +
    slugify(filesMetadata[0].source) +
    '-file-list.yml')
  await fsPromises.writeFile(listFilePath, list)
  console.log('Files list created at ' + listFilePath)
}

// Generate a copy-pasteable nav list in a file
async function outputNavList (filesMetadata) {
  let list = ''
  filesMetadata.forEach(function (file) {
    list += '- label: "' + file.label + '"\n' +
            '  file: "' + file.name + '"\n' +
            '  id: "' + file.id + '"\n'
  })

  const listFilePath = fsPath.normalize(process.cwd() +
    '/_output/' +
    slugify(filesMetadata[0].source) +
    '-nav-list.yml')
  await fsPromises.writeFile(listFilePath, list)
  console.log('Nav/TOC list created at ' + listFilePath)
}

// Split a markdown file into separate files
async function splitMarkdownFile (argv) {
  // Check that we have a valid marker to split on.
  // Our regex finds that marker at the start of the doc
  // or at the beginning of any new line.
  // By default, we look for # not followed by another #,
  // to prevent splitting at both # and ##.
  let splitMarker = '#'
  let splitRegex = /^#(?!#)|\n#(?!#)/
  if (explicitOption('split') && argv.split !== '#') {
    splitMarker = argv.split
    splitRegex = new RegExp('^' + splitMarker + '(?!' + splitMarker + ')|\n' + splitMarker + '(?!' + splitMarker + ')')
  }

  // Check that we have a valid book to work in
  let bookDirectoryName
  if (pathExists(fsPath.normalize(process.cwd() + '/' + argv.book))) {
    bookDirectoryName = argv.book
  } else {
    console.error('Can\'t find directory named ' + argv.book + ' while splitting markdown file.')
  }

  // The source argument might refer to a docx file, before
  // conversion to markdown. So we need to change the extension,
  // and assume we're splitting the converted markdown equivalent.
  let fileToSplit = fsPath.normalize(process.cwd() + '/' + bookDirectoryName + '/' + argv.source)
  fileToSplit = fsPath.format({ ...fsPath.parse(fileToSplit), base: '', ext: '.md' })

  // Get the filename without its extension, for use later
  const filenameWithoutExtension = fsPath.basename(fileToSplit, fsPath.extname(fileToSplit))

  // Update the user
  console.log('Splitting ' + fileToSplit + ' …')

  // Create a files-data object, which we'll offer the user
  // later for easy including in a book's YAML file list.
  const filesMetadata = []

  // Split the file if it exists
  if (pathExists(fileToSplit)) {
    const fileObject = fs.readFileSync(fileToSplit)
    const filePartsArray = fileObject.toString('utf8').split(splitRegex)
    const numberOfFileParts = filePartsArray.length

    // Create a counter for every filePart,
    // and a counter for those we actually use.
    let filePartCounter = 0
    let bookPartCounter = 0

    // Write each filepart to a new file
    filePartsArray.forEach(function (filePart) {
      // Create a filename from the first line
      // and a slug of that for use later
      const firstLine = filePart.slice(0, filePart.indexOf('\n')).trim()

      let firstLineSlug
      if (firstLine) {
        firstLineSlug = slugify(firstLine)
      }

      // If this is the first filePart, only create a file
      // if it has content, since .split() will create
      // one filePart before the first split marker.
      const regexForFileContent = /.+/
      const firstFileHasContent = filePartsArray[0].match(regexForFileContent)
      if ((filePartsArray[0] === filePart && firstFileHasContent) || filePartCounter > 0) {
        // Count the files we're creating
        bookPartCounter += 1

        // Split marker to add back
        // The split marker was removed during split(),
        // so we write it back at the start of the first line,
        // unless this was a first filePart without a starting split marker,
        // in which case, no split marker to add back.
        let splitMarkerToAddBack = splitMarker
        if (filePartsArray[0] === filePart && firstFileHasContent) {
          splitMarkerToAddBack = ''
        }

        // Define top-of-page-YAML, with title as the first line.
        const yamlFrontmatter = '---\n' +
          'title: "' + firstLine + '"\n' +
          '---\n\n' + splitMarkerToAddBack

        // Insert the top-of-page YAML
        filePart = yamlFrontmatter + filePart

        // Get a number for the filename.
        // We pad the file numbering to allow for
        // the potential addition of, say, 20% future files.
        // We assume no book will have more than 9999 files.
        let newFileNumber
        if (numberOfFileParts < 80) {
          newFileNumber = bookPartCounter.toString().padStart(2, '0')
        } else if (numberOfFileParts < 800) {
          newFileNumber = bookPartCounter.toString().padStart(3, '0')
        } else {
          newFileNumber = bookPartCounter.toString().padStart(4, '0')
        }

        // If the file has no first line for a slug,
        // do not use a separator for the filename
        let fileNameSeparator = ''
        if (firstLine && firstLineSlug) {
          fileNameSeparator = '-'
        }

        // Write the file
        const newFileName = newFileNumber + fileNameSeparator + firstLineSlug + '.md'
        const pathToNewFile = fsPath.normalize(process.cwd() + '/' + bookDirectoryName + '/' + newFileName)
        fsPromises.writeFile(pathToNewFile, filePart)

        // Add its info to the files metadata
        const fileMetadata = {}
        fileMetadata.source = filenameWithoutExtension
        fileMetadata.label = firstLine
        fileMetadata.name = newFileNumber + fileNameSeparator + firstLineSlug
        fileMetadata.id = firstLineSlug
        filesMetadata.push(fileMetadata)
      }

      // Are we done?
      filePartCounter += 1
      if (filePartCounter === numberOfFileParts) {
        console.log('Done splitting ' + argv.source + '.')

        // Generate the file list
        outputFileList(filesMetadata)

        // Generate a nav list
        outputNavList(filesMetadata)
      }
    })
  } else {
    console.error('Can\'t find ' + fileToSplit + ' in ' + bookDirectoryName + ' for splitting.')
  }
}

module.exports = splitMarkdownFile
