const fs = require('fs-extra')
const fsPath = require('path')
const pandoc = require('node-pandoc')
const slugify = require('../../../gulp/helpers/utilities.js').ebSlugify
const explicitOption = require('./explicitOption.js')
const splitMarkdownFile = require('./splitMarkdownFile.js')

// Convert with Pandoc
async function convertToMarkdown (argv) {
  console.log('Converting ' + argv.source + ' …')

  try {
    // Get information about the source file
    const sourceFile = fsPath.normalize(process.cwd() + '/_source/' + argv.source)
    const sourceIsValid = fs.existsSync(fsPath.normalize(sourceFile)) &&
      fsPath.extname(sourceFile) === '.docx'

    if (sourceIsValid === false) {
      console.log('Looking for ' + sourceFile) // debugging
      console.error('Sorry, can\'t find ' + argv.source + ' in the \'_source\' folder,' +
        ' or it isn\'t a .docx file.')
      return false
    }

    // Check that the destination directory exists
    let destinationDirectory = fsPath.normalize(process.cwd() + '/' + argv.book)
    if (argv.name && explicitOption('name')) {
      const folderName = slugify(argv.name)
      destinationDirectory = fsPath.normalize(process.cwd() + '/' + folderName)
    }

    if (!fs.existsSync(fsPath.normalize(destinationDirectory))) {
      fs.mkdirSync(destinationDirectory, { recursive: true })
    }

    // If the source and destination are valid,
    // we can finalise filenames and run Pandoc.
    if (sourceIsValid) {
      // First, check or create a directory for images,
      // where Pandoc can put media from the .docx doc.
      const imageDestinationDirectory = destinationDirectory + '/images/_source'

      if (!fs.existsSync(fsPath.normalize(imageDestinationDirectory))) {
        fs.mkdirSync(imageDestinationDirectory, { recursive: true })
      }

      // Finalise destination file names
      const sourceFileBasename = fsPath.basename(sourceFile, '.docx')
      const outputFilename = slugify(sourceFileBasename) + '.md'
      const outputFile = fsPath.normalize(destinationDirectory + '/' + outputFilename)

      // Run Pandoc.
      // Passing Pandoc an array is safer than a string because
      // it handles potential spaces in the source filename.
      // We must provide --resource-path or pandoc will look
      // for images in the working directory.
      const pandocArgs = [
        '--resource-path', process.cwd() + '/_source',
        '-f', 'docx',
        '-t', 'markdown_mmd',
        '--output', outputFile,
        '--markdown-headings', 'atx',
        '--wrap', 'none',
        '--toc',
        '--extract-media', imageDestinationDirectory
      ]

      function pandocCallback (error) {
        if (error) {
          console.error(error)
        } else {
          console.log('Conversion complete, see ' + outputFile)

          // Were we also asked to --split the file?
          if (explicitOption('split')) {
            splitMarkdownFile(argv)

            // If the file has been split, remove the original
            fs.unlink(outputFile, (err) => {
              if (err) throw err
            })
          }
        }
      }

      pandoc(sourceFile, pandocArgs, pandocCallback)
    }
  } catch (error) {
    console.error('Unable to convert ' + argv.source)
  }
}

module.exports = convertToMarkdown
