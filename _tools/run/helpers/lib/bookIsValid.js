const options = require('../options.js').options
const works = require('../paths/works.js')
const explicitOption = require('./explicitOption.js')

// Check that the --book value is valid
async function bookIsValid (argv) {
  let validity = true

  // If the --book value is not among works
  // in this project, and it was explicitly passed,
  // it's not a valid choice
  if (argv.book && explicitOption('book')) {
    // Allow any work, plus the `assets` folder
    const validWorks = await works()
    validWorks.push('assets')

    if (!validWorks.includes(argv.book)) {
      validity = false

      if (argv.book === options.book.default) {
        console.error('Sorry, this project does not include a default %s.', argv.book)
      } else {
        console.error('Sorry, %s is not a work in this project.', argv.book)
      }
      process.exit()
    }
  }

  return validity
}

module.exports = bookIsValid
