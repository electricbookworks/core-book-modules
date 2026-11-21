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
// A block comment normally marks the following element as its index
// target. But some nodes can't host an ID -- a non-element node like
// display math, or an unsuitable element (script, br, hr ...). In those
// cases we insert a standalone <span> anchor at the comment's position
// instead. This must match the server-side renderIndexCommentsAsTargets
// (gulp/cheerio) and build-reference-index, so the IDs the browser
// generates equal the IDs in the prebuilt reference-index database.

// Element tag names (uppercase) that should never host an index target.
const ebIndexTargetDenylist = ['BR', 'HR', 'WBR', 'SCRIPT', 'STYLE', 'TEMPLATE',
  'COL', 'COLGROUP', 'SOURCE', 'TRACK', 'PARAM', 'META', 'LINK', 'BASE', 'AREA']

// Parent tag names (uppercase) whose content model forbids a <span> child;
// inside these we mark an element rather than inject a standalone anchor.
const ebIndexRestrictedParents = ['UL', 'OL', 'DL', 'TABLE', 'THEAD', 'TBODY',
  'TFOOT', 'TR', 'SELECT', 'OPTGROUP', 'MENU', 'COLGROUP']

// Walk forward from a comment over sibling nodes, skipping whitespace-only
// text and other comments, to classify what the comment points at: a
// significant text node (e.g. display math, which can't host an ID), an
// element (a potential host), or nothing in scope.
function ebIndexFirstSignificantFollowing (commentNode) {
  let node = commentNode.nextSibling
  while (node) {
    // Explicit `node: node` (not shorthand) for Prince's older JS parser.
    if (node.nodeType === 3 && /\S/.test(node.nodeValue || '')) {
      return { kind: 'text', node: node } // eslint-disable-line
    }
    if (node.nodeType === 1) {
      return { kind: 'element', node: node } // eslint-disable-line
    }
    node = node.nextSibling
  }
  return { kind: 'none', node: null }
}

// Decide how a comment is rendered: mark the following element, insert a
// standalone anchor (block comment pointing at a non-hostable node), or
// insert an inline anchor (comment inside running text). 'skip' means there
// is no valid target. Mirrors the server-side pre-render step so IDs stay in sync.
// Note this runs before MathJax, so display math is still bare `\[...\]`
// text; denylisting SCRIPT also covers math authored as a <script> tag.
function ebIndexClassifyComment (commentNode) {
  const previous = commentNode.previousSibling
  const next = commentNode.nextSibling

  // A block comment sits on its own line between elements; an inline comment
  // sits within running text (so its siblings aren't line breaks).
  const isBlock = previous && next &&
    /^\n/.test(previous.nodeValue || '') &&
    /^\n/.test(next.nodeValue || '')

  if (!isBlock) {
    return { targetType: 'inline', element: commentNode.parentElement }
  }

  const following = ebIndexFirstSignificantFollowing(commentNode)
  const parentTag = commentNode.parentElement
    ? commentNode.parentElement.tagName
    : ''

  if (following.kind === 'element' &&
    ebIndexTargetDenylist.indexOf(following.node.tagName) === -1) {
    return { targetType: 'element', element: following.node }
  }

  if (ebIndexRestrictedParents.indexOf(parentTag) !== -1) {
    // A standalone <span> would be invalid here, so mark the next element
    // if there is one; otherwise skip this comment.
    if (following.kind === 'element') {
      return { targetType: 'element', element: following.node }
    }
    return { targetType: 'skip', element: null }
  }

  return { targetType: 'standalone', element: null }
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

    if (comment.targetType === 'element') {
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
    } else {
      // Insert a <span> target at the comment's position. This runs for
      // inline comments and for 'standalone' block comments that point at a
      // non-hostable node (e.g. display math). We insert the span as a
      // sibling node (never by reserialising the parent's innerHTML), so we
      // leave the surrounding DOM and its event listeners intact.
      const idBase = entriesForElement[0].slug
      const occurrencesSoFar = (generatedIdCounts[idBase] || 0) + 1
      generatedIdCounts[idBase] = occurrencesSoFar

      const span = document.createElement('span')
      span.id = idBase + '--iid-' + occurrencesSoFar
      span.classList.add('index-target')
      span.setAttribute('data-index-entries', JSON.stringify(entriesForElement))

      if (comment.targetType === 'standalone') {
        // A standalone anchor between blocks (e.g. before display math).
        // Keep it in flow but zero-size so it doesn't disturb layout and
        // matches the server-pre-rendered markup used for PDF/epub.
        span.classList.add('index-target-standalone')
        span.setAttribute('style', 'display: block; height: 0; line-height: 0; overflow: hidden')
      }

      const commentNode = comment.commentNode
      commentNode.parentNode.insertBefore(span, commentNode.nextSibling)
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
        const classification = ebIndexClassifyComment(treeWalker.currentNode)

        // Skip a comment with no valid target (e.g. nothing follows it
        // inside a restricted-content parent like a list or table).
        if (classification.targetType !== 'skip') {
          comments.push({
            commentText: treeWalker.currentNode.nodeValue,
            element: classification.element,
            commentNode: treeWalker.currentNode,
            targetType: classification.targetType
          })
        }
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
          const classification = ebIndexClassifyComment(thisNode)

          if (classification.targetType !== 'skip') {
            comments.push({
              commentText: thisNode.nodeValue,
              element: classification.element,
              commentNode: thisNode,
              targetType: classification.targetType
            })
          }
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
