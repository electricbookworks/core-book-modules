const configsObject = require('./configsObject.js')

// Check if MathJax is enabled in config or CLI arguments
function mathjaxEnabled (argv) {
  // Check if Mathjax is enabled in Jekyll config
  const mathjaxConfig = configsObject(argv)['mathjax-enabled']

  // Is mathjax on either in config
  // or activated by argv option?
  let mathJaxOn = false
  if (argv.mathjax || mathjaxConfig === true) {
    mathJaxOn = true
  }

  return mathJaxOn
}

module.exports = mathjaxEnabled
