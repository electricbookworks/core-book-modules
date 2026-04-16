// Shared post-Jekyll pipeline for building merged HTML ready
// for Prince. Used by both `pdf()` output and the `refine`
// command to avoid duplicating the build sequence.
//
// Runs: processContent → renderIndexComments → renderIndexLinks
//       → merge → renderMathjax → pdfHTMLTransformations

const processContent = require('./processContent.js')
const renderIndexComments = require('./renderIndexComments.js')
const renderIndexLinks = require('./renderIndexLinks.js')
const renderMathjax = require('./renderMathjax.js')
const pdfHTMLTransformations = require('./pdfHTMLTransformations.js')
const merge = require('../merge')

async function pdfPipeline (argv) {
  await processContent(argv)
  await renderIndexComments(argv)
  await renderIndexLinks(argv)
  await merge(argv)
  await renderMathjax(argv)
  await pdfHTMLTransformations(argv)
}

module.exports = pdfPipeline
