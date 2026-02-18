const pathExists = require('../paths/pathExists.js')

// Return a string of Jekyll config files.
// The filenames passed must be of files
// already saved in the _configs directory.
// They will be added after the default _config.yml.
function configString (argv) {
  // Start with default config
  let string = '_config.yml'

  // Add format config, if any
  if (argv && argv.format) {
    string += ',_configs/_config.' + argv.format + '.yml'
  }

  // Add any configs passed as argv's
  if (argv && argv.configs) {
    console.log('Adding ' + argv.configs + ' to configs...')
    // Strip quotes that might have been added around arguments by user
    string += ',_configs/' + argv.configs.replace(/'/g, '').replace(/"/g, '')
  }

  // Add OS-specific app configs, if we're building an app and those configs exist
  if (argv && argv.format === 'app') {
    if (argv['app-os'] &&
        pathExists(process.cwd() + '/_configs/_config.app.' + argv['app-os'] + '.yml')) {
      string += ',_configs/_config.app.' + argv['app-os'] + '.yml'
    }
  }

  // Add MathJax config if --mathjax=true
  if (argv && argv.mathjax) {
    string += ',_configs/_config.mathjax-enabled.yml'
  }

  // Turn Mathjax off if we're exporting to Word.
  // We want raw editable TeX in Word docs.
  if (argv && argv._[0] === 'export' && argv['export-format'] === 'word') {
    string += ',_configs/_config.math-disabled.yml'
  }

  // Add docx config if we're exporting to Word.
  if (argv && argv._[0] === 'export' && argv['export-format'] === 'word') {
    string += ',_configs/_config.docx.yml'
  }

  // Set webrick headers if --cors
  if (argv && argv.cors) {
    string += ',_configs/_config.webrick.cors.yml'
  }

  return string
}

module.exports = configString
