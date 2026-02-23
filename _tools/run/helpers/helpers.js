// Require all helper modules from lib directory
// and re-export them as a flat object.
const path = require('path')
const requireAll = require('require-all')

const helpers = requireAll({
  dirname: path.join(__dirname, 'lib'),
  filter: /(.+)\.js$/
})

module.exports = helpers
