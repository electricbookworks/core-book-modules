const fs = require('fs-extra')
const fsPath = require('path')

// Add files to the epub folder.
// The destinationFolder assumes, and is
// relative to, the destination epub folder,
// e.g. it might be `book/images/epub`.
// If you include a directory in the arrayOfPaths,
// its contents will be copied to the destination.
async function addToEpub (arrayOfPaths, destinationFolder) {
  try {
    // Ensure the destinationFolder ends with a slash
    if (!destinationFolder.endsWith('/')) {
      destinationFolder += '/'
    }

    // Build the full destination path
    const destinationFolderPath = fsPath.normalize(process.cwd() +
              '/_site/epub/' + destinationFolder)

    // Create the destination directory
    fs.mkdirSync(destinationFolderPath, { recursive: true })

    // Track how many files we have to copy
    const totalFiles = arrayOfPaths.length
    let totalCopied = 0

    // Add each file in the array to the destination
    arrayOfPaths.forEach(function (path) {
      path = fsPath.normalize(path)

      if (fs.existsSync(path)) {
        try {
          // Destination depends on whether we are
          // copying a directory or a file
          if (fs.lstatSync(path).isDirectory()) {
            fs.copySync(path, destinationFolderPath)
          } else {
            fs.copySync(path, destinationFolderPath +
                              fsPath.basename(path))
          }

          console.log('Copied ' + path + ' to epub folder.')
          totalCopied += 1

          // Check if we're done
          if (totalCopied === totalFiles) {
            return true
          }
        } catch (error) {
          console.log('Could not copy ' + path + ' to epub folder: \n' +
                          error)
        }
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = addToEpub
