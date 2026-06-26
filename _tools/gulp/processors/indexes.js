// Lint with JS Standard

// Import Node modules
const cheerio = require('gulp-cheerio')
const cheerioCore = require('cheerio')
const gulp = require('gulp')
const { decode } = require('entities')
const { marked } = require('marked')

// Local helpers
const { indexTargets } = require('../helpers/paths.js')
const { ebSlugify } = require('../helpers/utilities.js')
const { format } = require('../helpers/args.js')
const htmlFilePaths = require('../../run/helpers/paths/htmlFilePaths.js')

// A cheerio equivalent of ebDecodeHtmlEntitiesPreservingTags
// from assets/js/utilities.js
function decodeHtmlEntitiesPreservingTags (html) {
  // Load as a fragment (not a full document)
  const $ = cheerioCore.load(html, null, false)

  function decodeTextNodes (el) {
    $(el).contents().each((_, node) => {
      if (node.type === 'text') {
        node.data = decode(node.data)
      } else if (node.type === 'tag') {
        decodeTextNodes(node)
      }
    })
  }

  decodeTextNodes($.root())

  return $.root().html()
}

// Check whether to use XML mode
function isXMLMode () {
  // Note: this needs to return a string,
  // hence the quotes around 'true' and 'false'.
  if (format === 'epub') {
    return 'true'
  } else {
    return 'false'
  }
}

// Turn HTML comments for book indexes into index targets by marking
// the indexed element with an ID (reusing any existing ID) and recording
// its entries in a `data-index-entries` attribute.
// This is a pre-processing alternative to assets/js/index-targets.js,
// which dynamically marks index targets in web clients.
// It duplicates much of what index-targets.js does. So, if you
// update it, you may need to update index-targets.js as well.
async function renderIndexCommentsAsTargets (done) {
  const paths = await htmlFilePaths(null, null, { allFiles: true })
  gulp.src(paths, { base: './', allowEmpty: true })
    .pipe(cheerio({
      run: function ($) {
        // Skip if we've already completed this process.
        if ($('body').attr('data-index-targets') === 'loaded') {
          return
        }

        // Track generated IDs so that each one is unique on the page.
        // An indexed element with no existing ID gets an ID built from
        // its first entry's slug plus an occurrence counter.
        const generatedIdCounts = {}

        $('*').contents()
          // Return only comment nodes...
          .filter(function () {
            return this.nodeType === 8
          })
          // .. that start with `index:`
          .filter(function () {
            return (/^\s*index:/).test(this.data)
          })
          .each(function (unusedIndex, comment) {
            // Is this comment between elements ('block')
            // or inline (e.g. inside a paragraph)?
            const startsWithLinebreak = /^\n/
            let position
            if (comment.prev &&
                comment.next &&
                startsWithLinebreak.test(comment.prev.data) &&
                startsWithLinebreak.test(comment.next.data)) {
              position = 'block'
            } else {
              position = 'inline'
            }

            // The element this comment indexes. For a block comment this
            // is the following element; for an inline comment it is the
            // element that contains the comment. Setting an ID on this
            // element is always valid, so we avoid the invalid-child
            // problems (e.g. EPUBCheck RSC-005) that came from inserting
            // anchors into elements like dl, ul, ol or table.
            let indexedElement
            if (position === 'block') {
              indexedElement = $(comment).nextAll().first()
            } else {
              indexedElement = $(comment).parent()
            }

            // If there's no element to index, skip this comment.
            if (!indexedElement || indexedElement.length === 0) {
              return
            }

            // Split the lines into an array. Each line is an index entry.
            const commentLines = comment.data.split('\n')

            // Collect the entries this comment adds to the indexed element.
            const entriesForElement = []

            // Process each line, i.e. each index entry in the comment.
            commentLines.forEach(function (line) {
              // Remove the opening 'index:' prefix.
              const indexKeywordRegex = /^\s*index:/
              if (indexKeywordRegex.test(line)) {
                line = line.replace(indexKeywordRegex, '')
              }

              // Strip white space at start and end of line.
              line = line.trim()

              // Exit if the stripped line is now empty.
              // We only want to process actual book-index terms.
              if (line === '') {
                return
              }

              // Split the line into its entry components.
              // It might be a nested entry, where each level
              // of nesting appears after double backslashes.
              // e.g. software \\ book-production
              const rawEntriesByLevel = line.split('\\')

              // Trim whitespace from each entry
              // https://stackoverflow.com/a/41183617/1781075
              // and remove any leading or trailing tildes.
              const entriesByLevel = rawEntriesByLevel.map(function (str) {
                return str.trim().replace(/^~+|~+$/, '')
              })

              // Check for starting or ending tildes.
              // If one exists, flag the entry as `from` or `to`,
              // starting or ending a reference range. Then strip the tildes.
              let range = ''

              if (line.substring(0, 1) === '~') {
                range = 'to'
                line = line.substring(1)
              } else if (line.substring(line.length - 1) === '~') {
                range = 'from'
                line = line.substring(0, line.length - 1)
              }

              // Slugify the target text to use in an ID and to look up
              // the entry in the index list. We process the text as
              // markdown, because we need HTML tag content included, as
              // it is for listItemSlug. But we remove HTML entities first.
              const processedLine = decodeHtmlEntitiesPreservingTags(marked.parseInline(line))
              const entrySlug = ebSlugify(processedLine, true)

              entriesForElement.push({
                slug: entrySlug,
                text: entriesByLevel.slice(-1).pop(),
                tree: entriesByLevel,
                range: range // eslint-disable-line
              })
            })

            // If the comment held no actual entries, there's nothing to mark.
            if (entriesForElement.length === 0) {
              return
            }

            // Give the element an ID if it doesn't already have one.
            // If it does, we reuse it for the index links.
            if (!indexedElement.attr('id')) {
              const idBase = entriesForElement[0].slug
              const occurrencesSoFar = (generatedIdCounts[idBase] || 0) + 1
              generatedIdCounts[idBase] = occurrencesSoFar
              indexedElement.attr('id', idBase + '--iid-' + occurrencesSoFar)
            }

            // Flag the element as an index target and record its entries,
            // merging with any entries an earlier comment added to it.
            indexedElement.addClass('index-target')

            let existingEntries = []
            const existingEntriesAttribute = indexedElement.attr('data-index-entries')
            if (existingEntriesAttribute) {
              existingEntries = JSON.parse(existingEntriesAttribute)
            }
            indexedElement.attr('data-index-entries',
              JSON.stringify(existingEntries.concat(entriesForElement)))
          })

        // Finally, flag that we're done.
        $('body').attr('data-index-targets', 'loaded')
      },
      parserOptions: {
        // XML mode necessary for epub output
        // and must be false for PDF output
        xmlMode: isXMLMode()
      }
    }))
    .pipe(gulp.dest('./'))
  done()
}

// Check HTML pages for reference indexes. If we find any,
// look up each list item in the book-index-*.js, and add a link.
// This is a pre-processing alternative to assets/js/index-lists.js,
// which dynamically adds links to reference indexes client-side.
// This pre-processing alternative is necessary for offline formats.
// It duplicates much of what index-lists.js does. So, if you
// update it, you may need to update index-lists.js as well.
async function renderIndexListReferences (done) {
  const paths = await htmlFilePaths(null, null, { allFiles: true })
  gulp.src(paths, { base: './', allowEmpty: true })
    .pipe(cheerio({
      run: function ($) {
        // Add a link to an entry in a reference index
        function ebIndexAddLink (listItem, pageReferenceSequenceNumber, entry) {
          const link = $('<a>​</a>')
            .attr('href', entry.filename + '#' + entry.id)
            .text(pageReferenceSequenceNumber)

          // Add a class to flag whether this link starts
          // or ends a reference range.
          if (entry.range === 'from' || entry.range === 'to') {
            link.addClass('index-range-' + entry.range)
          } else {
            link.addClass('index-range-none')
          }

          // If the listItem has child lists, insert the link
          // before the first child list. Otherwise, append the link.
          if ($(listItem).find('ul').length > 0) {
            link.insertBefore($(listItem).find('ul'))
          } else {
            link.appendTo(listItem)
          }
        }

        // Add a link to a specific reference-index entry
        function ebIndexFindLinks (listItem, ebIndexTargets) {
          listItem = $(listItem)
          const nestingLevel = listItem.parentsUntil('.reference-index').length / 2

          // We're already looping through all `li`, even descendants.
          // For each one, contruct its tree from its parent nodes.
          // When we look up this entry in the db, we'll compare
          // the constructed tree with the real one in the index 'database'.
          const listItemTree = []

          // If a list item has a parent list item, add its
          // text value to the beginning of the tree array.
          // Iterate up the tree to each possible parent.

          // If the list item has a first child that contains text
          // use that text; otherwise use the entire list item's text.

          // Get the text value of an li without its children
          // or any index links already added by this process.
          function getListItemText (li) {
            const listItemClone = li.clone()
            listItemClone.find('ul').remove()
            listItemClone.find('a').remove()

            // If page refs have already been added to the li,
            // we don't want those in the text. They appear after
            // a line break, so we regex everything from that \n.
            // We need the tag names of HTML, but not the symbols, in the slug.
            // So we have to decode the HTML first to remove encoded HTML.
            const text = decode(listItemClone.html())
            return text
          }

          listItemTree.push(getListItemText(listItem))

          function buildTree (listItem) {
            if (listItem.parent() &&
                                listItem.parent().closest('li').contents()[0]) {
              listItemTree.unshift(getListItemText(listItem.parent().closest('li')))
              buildTree(listItem.parent().closest('li'))
            }
          }

          if (nestingLevel > 0) {
            buildTree(listItem)
          }

          // Reconstruct the reference's text value from the tree
          // and save its slug.
          const listItemSlug = ebSlugify(listItemTree.join(' \\ '), true)

          // Look through the index 'database' of targets
          // Each child in the ebIndexTargets array represents
          // the index anchor targets on one HTML page.

          // Set this counter here, so that links are numbered
          // sequentially across target HTML files
          // (e.g. if a range spans two HTML files)
          let pageReferenceSequenceNumber = 1

          ebIndexTargets.forEach(function (pageEntries) {
            // Find this entry's page numbers
            let rangeOpen = false
            pageEntries.forEach(function (entry) {
              if (entry.entrySlug === listItemSlug) {
                // If a 'from' link has started a reference range,
                // skip links till the next 'to' link that closes the range.
                if (entry.range === 'from') {
                  rangeOpen = true
                  ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry)
                  pageReferenceSequenceNumber += 1
                }
                if (rangeOpen) {
                  if (entry.range === 'to') {
                    ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry)
                    pageReferenceSequenceNumber += 1
                    rangeOpen = false
                  }
                } else {
                  ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry)
                  pageReferenceSequenceNumber += 1
                }
              }
            })
          })
        }

        // Get all the indexes on the page, and start processing them.
        function ebIndexPopulate (ebIndexTargets) {
          // Don't do this if the list links are already loaded.
          if ($('.wrapper').attr('data-index-list') === 'loaded') {
            return
          }

          const listItems = $('.reference-index li')

          if (listItems.length > 0) {
            listItems.each(function () {
              ebIndexFindLinks(this, ebIndexTargets)
            })
          }
        }

        const indexLists = $('.reference-index')
        if (indexLists.length > 0) {
          let indexListsProcessed = 0
          indexLists.each(function () {
            // paths.js already loads the index targets for the current
            // book, language and output format, so we use them directly.
            ebIndexPopulate(indexTargets)

            // Flag when we're done
            indexListsProcessed += 1
            if (indexListsProcessed === indexLists.length ||
                                indexLists.length === 1) {
              $('.wrapper').attr('data-index-list', 'loaded')
            }
          })
        }
      },
      parserOptions: {
        // XML mode necessary for epub output
        // and must be false for PDF output
        xmlMode: isXMLMode()
      }
    }))
    .pipe(gulp.dest('./'))
  done()
}

exports.renderIndexCommentsAsTargets = renderIndexCommentsAsTargets
exports.renderIndexListReferences = renderIndexListReferences
