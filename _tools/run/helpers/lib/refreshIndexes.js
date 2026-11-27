const fs = require('fs-extra')
const buildReferenceIndex = require('../reindex/build-reference-index.js')
const buildSearchIndex = require('../reindex/build-search-index.js')
const webpack = require('./webpack.js')
const jekyll = require('./jekyll.js')
const renderIndexComments = require('./renderIndexComments.js')
const processContent = require('./processContent.js')
const epubHTMLTransformations = require('./epubHTMLTransformations.js')
const works = require('../paths/works.js')
const translations = require('../paths/translations.js')
const allFilesListed = require('./allFilesListed.js')
const projectSettings = require('./projectSettings.js')
const configsObject = require('./configsObject.js')

// Refresh indexes
async function refreshIndexes (argv) {
  try {
    /*
    Much of _tools doesn't properly cater for the baseurl.
    The assumption in most methods is that baseurl is ''.
    Setting baseurl here is a temporary/safe fix to avoid further regressions for now.
    */
    const _argv = {
      ...argv,
      baseurl: ''
    }
    if (!_argv.skipbuild) {
      await fs.emptyDir(process.cwd() + '/_site')
      await webpack(_argv)
      await jekyll(_argv)

      // For epub, the shipped index anchors are pre-rendered AFTER
      // epubHTMLTransformations mutate the DOM, so the DB must be scraped from
      // the transformed tree to match the output. (PDF pre-renders them
      // before its transforms, so it needs none here; see the output
      // pipeline order.)
      if (argv.format === 'epub') {
        const allWorks = await works()
        for (const work of allWorks) {
          await processContent({ ..._argv, book: work })
          await epubHTMLTransformations({ ..._argv, book: work })

          const languages = await translations(work)
          for (const language of languages) {
            await processContent({ ..._argv, book: work, language })
            await epubHTMLTransformations({ ..._argv, book: work, language })
          }
        }
      }
    }
    if (argv.format === 'print-pdf' ||
      argv.format === 'screen-pdf' ||
      argv.format === 'epub') {
      // No server-side renderMathjax first: the output pre-renders index
      // targets BEFORE it renders mathjax (and before merge/transforms), so
      // the DB must be pre-rendered from the same pre-mathjax DOM or the ids
      // diverge (e.g. an index comment before display math pre-renders a
      // standalone target, but would mark the rendered math element after).
      await renderIndexComments(_argv, { allFiles: true })
    }

    const filesForIndexing = await allFilesListed(_argv, { check: true })
    if (projectSettings()['dynamic-indexing'] !== false) {
      buildReferenceIndex(argv.format, filesForIndexing)
    }

    if (argv.format === 'web' ||
      argv.format === 'app') {
      buildSearchIndex(argv.format, filesForIndexing, configsObject())
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = refreshIndexes
