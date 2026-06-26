/* global NodeFilter */
import ebSlugify from '../../_tools/utilities/slugify'
import { ebDecodeHtmlEntitiesPreservingTags } from './utilities'
import marked from './marked'

// This script helps create dynamic book indexes.
// It finds all HTML comments that start with
// <!-- index or <!--index and parses each line,
// assuming each line represents an entry in the index.
// For a comment between blocks, it marks the following
// element with an ID, reusing the element's existing ID
// if it has one. For an inline comment (inside a paragraph
// or other text), it inserts a <span> target with an ID at
// the exact position of the comment. The book index links
// to that ID. We insert the span as a sibling node, never
// by reserialising the parent's innerHTML, so we don't
// destroy the surrounding DOM; and a <span> is valid wherever
// an inline comment can appear, so we never add invalid children.
// Comment lines that start or end with a tilde
// start or end ranges of content that contain the
// ongoing presence of a given concept. Each entry records
// a 'to' or 'from' range, which is important
// for the separate process that generates hyperlinks
// in the final book index.

// Notes on development:
// To find comment nodes, TreeWalker is fastest.
// If the browser doesn't support TreeWalker, we iterate
// over the entire DOM ourselves, which is slower.

// This script is not used for PDF and epub outputs.
// PrinceXML does not 'see' HTML comments at all.
// So for PrinceXML output, we prerender the HTML with gulp/cheerio.
// The script is included in PDF outputs so that
// Puppeteer can use it for indexing PDF outputs.
// In epub readers, the links don't work from the index
// because the targets would only exist when the target
// page is rendered. Browsers handle this fine, but not ereaders.
// So if you change this script, you may need to make similar
// changes to `renderIndexCommentsAsTargets` in gulpfile.js.

// Options
// -------
// Block-level elements are those tags that will be
// index targets for any index comment that appears
// immediately before them in the DOM. For any other
// element not included in this list, the index comment
// is treated as inline and indexes the element that
// contains the comment instead.
// Note that element names must be uppercase here.
// (Note: our gulp equivalent uses a different logic
// that may be more reliable than this.)
// We include `script` tags so that MathJax blocks,
// which are in script tags, can also be considered
// when determining inline vs block-level index tags.
const ebIndexOptions = {
  blockLevelElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'P', 'BLOCKQUOTE', 'OL', 'UL', 'TABLE', 'DL', 'DIV', 'SCRIPT']
}

// Process the comments to create index targets we can link to.
// A comment between blocks marks the following element with an ID
// (reusing any existing ID). An inline comment inserts a <span>
// target at the exact position of the comment. We insert that span
// as a sibling node (never by reserialising the parent's innerHTML),
// so we don't destroy the surrounding DOM, and a <span> is valid
// phrasing content wherever an inline comment can appear, so we
// never create invalid child elements.
function ebIndexProcessComments (comments) {
  // Track generated IDs so that each one is unique on the page.
  // An indexed element with no existing ID gets an ID built from
  // its first entry's slug plus an occurrence counter.
  const generatedIdCounts = {}

  // If there are no comments, note that in the
  // `data-index-targets` attribute.
  if (comments.length < 1 || !comments) {
    document.body.setAttribute('data-index-targets', 'none')
  }

  // Process each comment in the `comments` array.
  comments.forEach(function (comment) {
    // Each line in the comment is a separate index entry.
    const commentLines = comment.commentText.split('\n')

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
      if (line === '') {
        return
      }

      // Split the line into its entry components.
      // It might be a nested entry, where each level
      // of nesting appears after double backslash \\.
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
      // starting or ending a reference range. Then strip the tilde.
      // Note, JS's `startsWith` and `endsWith` are not
      // supported in PrinceXML, so we didn't use those.
      let range = ''

      if (line.substring(0, 1) === '~') {
        range = 'to'
        line = line.substring(1)
      }
      if (line.substring(line.length - 1) === '~') {
        range = 'from'
        line = line.substring(0, line.length - 1)
      }

      // Slugify the target text to use in an ID
      // and to look up the entry in the index list.
      // The second argument indicates that we are slugifying an index term.
      // Process the text as markdown, because we need
      // HTML tag content included, as it is for listItemSlug.
      const processedLine = ebDecodeHtmlEntitiesPreservingTags(marked.parseInline(line))
      const entrySlug = ebSlugify(processedLine, true)

      // Note: do not use ES6 Object Property Shorthand,
      // it is not supported by Prince. Hence eslint-disable-line here.
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

    if (comment.targetType === 'inline') {
      // Insert a <span> target at the exact position of the comment.
      // We give it a generated ID built from the first entry's slug.
      const idBase = entriesForElement[0].slug
      const occurrencesSoFar = (generatedIdCounts[idBase] || 0) + 1
      generatedIdCounts[idBase] = occurrencesSoFar

      const span = document.createElement('span')
      span.id = idBase + '--iid-' + occurrencesSoFar
      span.classList.add('index-target')
      span.setAttribute('data-index-entries', JSON.stringify(entriesForElement))

      // Insert the span immediately after the comment, as a sibling node.
      // This does not reserialise the parent's innerHTML, so it leaves the
      // surrounding DOM (and any event listeners) intact.
      const commentNode = comment.commentNode
      commentNode.parentNode.insertBefore(span, commentNode.nextSibling)
    } else {
      // For a block comment, mark the following element itself.
      const indexedElement = comment.element

      // Give the element an ID if it doesn't already have one.
      // If it does, we reuse it for the index links.
      if (!indexedElement.id) {
        const idBase = entriesForElement[0].slug
        const occurrencesSoFar = (generatedIdCounts[idBase] || 0) + 1
        generatedIdCounts[idBase] = occurrencesSoFar
        indexedElement.id = idBase + '--iid-' + occurrencesSoFar
      }

      // Flag the element as an index target and record its entries,
      // merging with any entries an earlier comment added to it.
      indexedElement.classList.add('index-target')

      let existingEntries = []
      const existingEntriesAttribute = indexedElement.getAttribute('data-index-entries')
      if (existingEntriesAttribute) {
        existingEntries = JSON.parse(existingEntriesAttribute)
      }
      indexedElement.setAttribute('data-index-entries',
        JSON.stringify(existingEntries.concat(entriesForElement)))
    }
  })

  // Flag that we're done, if there were any comments to process.
  if (comments.length > 0) {
    document.body.setAttribute('data-index-targets', 'loaded')

    // If the URL hash matches a newly marked index target, scroll to it.
    const hash = window.location.hash
    if (hash) {
      const targetElement = document.getElementById(hash.slice(1))
      if (targetElement && targetElement.classList.contains('index-target')) {
        targetElement.scrollIntoView()
      }
    }
  }
}

// Get all the comments and add them to an array.
function ebIndexGetComments () {
  const comments = []

  let indexedElement, commentValue, nextElementSibling, nextSibling, targetType,
    targetText

  // Regex for testing if a comment is an indexing comment
  const isAnIndexComment = /^\s*index:/

  // Check for TreeWalker support.
  const useTreeWalker = true // debugging option
  if (document.createTreeWalker && useTreeWalker) {
    // https://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
    // By default, the TreeWalker will show all of the matching DOM nodes that it
    // finds. However, we can use an optional 'filter' method that will inform the
    // DOM traversal.
    function filter (node) {
      if (node.nodeValue === ' Load scripts. ') {
        return (NodeFilter.FILTER_SKIP)
      }
      return (NodeFilter.FILTER_ACCEPT)
    }

    // IE and other browsers differ in how the filter method is passed into the
    // TreeWalker. Mozilla takes an object with an 'acceptNode' key. IE takes the
    // filter method directly. To work around this difference, we will define the
    // acceptNode function a property of itself.
    filter.acceptNode = filter

    // NOTE: The last argument [] is a deprecated, optional parameter. However, in
    // IE, the argument is not optional and therefore must be included.
    const treeWalker = document.createTreeWalker(
      document.querySelector('.content'),
      NodeFilter.SHOW_COMMENT,
      filter,
      false
    )

    while (treeWalker.nextNode()) {
      if (isAnIndexComment.test(treeWalker.currentNode.nodeValue)) {
        nextSibling = treeWalker.currentNode.nextSibling
        nextElementSibling = treeWalker.currentNode.nextElementSibling

        // If the previous or next sibling elements of the comment
        // are elements, then this comment contains index entries
        // that should point to the start of the next element.

        // If the next sibling node is a text node, and
        // it actually contains text (isn't just space),
        // then we know that the index target must be inline, i.e.
        // inside a text element like a paragraph.

        if (nextElementSibling !== null &&
          ebIndexOptions.blockLevelElements.includes(nextElementSibling.tagName)) {
          indexedElement = treeWalker.currentNode.nextElementSibling
          targetType = 'element'
          targetText = ''
        } else {
          indexedElement = treeWalker.currentNode.parentElement
          targetType = 'inline'
          targetText = nextSibling.nodeValue
        }

        commentValue = treeWalker.currentNode.nodeValue

        // Note: do not use ES6 Object Property Shorthand,
        // it is not supported by Prince. Hence eslint-disable-line here.
        comments.push({
          commentText: commentValue,
          element: indexedElement,
          commentNode: treeWalker.currentNode,
          targetText: targetText, // eslint-disable-line
          targetType: targetType // eslint-disable-line
        })
      }
    }
  } else {
    function lookForComments (thisNode) {
      // Polyfill for IE < 9
      if (!Node) { // eslint-disable-line
        var Node = {} // eslint-disable-line
      }
      if (!Node.COMMENT_NODE) {
        Node.COMMENT_NODE = 8
      }

      for (thisNode = thisNode.firstChild; thisNode; thisNode = thisNode.nextSibling) {
        // If it's a comment node and it is not just whitespace
        if (thisNode.nodeType === Node.COMMENT_NODE &&
                        isAnIndexComment.test(thisNode.nodeValue)) {
          nextSibling = thisNode.nextSibling
          nextElementSibling = thisNode.nextElementSibling

          if (nextElementSibling !== null &&
            ebIndexOptions.blockLevelElements.includes(nextElementSibling.tagName)) {
            indexedElement = thisNode.nextElementSibling
            targetType = 'element'
            targetText = ''
          } else {
            indexedElement = thisNode.parentElement
            targetType = 'inline'
            targetText = nextSibling.nodeValue
          }

          commentValue = thisNode.nodeValue

          // Note: do not use ES6 Object Property Shorthand,
          // it is not supported by Prince. Hence eslint-disable-line here.
          comments.push({
            commentText: commentValue,
            element: indexedElement,
            commentNode: thisNode,
            targetText: targetText, // eslint-disable-line
            targetType: targetType // eslint-disable-line
          })
        } else {
          lookForComments(thisNode)
        }
      }
    }
    lookForComments(document.body)
  }

  ebIndexProcessComments(comments)
}

// Triage before processing comments.
export default function ebIndexTargetsInit () {
  // Don't run this in Prince or if the targets
  // are already loaded (e.g. by pre-processing)
  if (document.querySelector('[data-index-targets]') || process.env.output === 'screen-pdf' || process.env.output === 'print-pdf') {
    return
  }

  if (marked) {
    ebIndexGetComments()
  }
}
