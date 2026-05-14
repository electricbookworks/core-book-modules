/* globals Prince */

import { locales, pageLanguage } from './locales'

// Page cross-reference in print
// Use with css:
// content: prince-script(pagereference);

// From here, we use a function to generate content, either
// content: " (page " target-counter(attr(href), page) ")";
// or, if we're on the page we're targeting
// content: normal;

// Get the locale phrases for cross-references for this HTML document's language
// pageLanguage is provided by locales.js
const prePageNumberPhrase = locales[pageLanguage]['cross-references']['pre-page-number']
const postPageNumberPhrase = locales[pageLanguage]['cross-references']['post-page-number']

// A global variable for holding the page number being
// inserted into a book's index, for comparison with
// the last number inserted.
let ebCurrentBookIndexPageNumber = ''

function elidePageNumber (from, to) {
  // 'from' and 'to' are both strings indicating page numbers
  // the 'to' string needs to be compared to the 'from' string,
  // and elided where appropriate, according to CORE styles

  // First check whether the strings are the same length
  // e.g 99-103 should be left alone
  if (from.length !== to.length) {
    return to
  }

  // If they are the same length, start comparing digits
  let i = 0
  let fromDigit
  let toDigit
  // Compare digits starting from the beginning of the string, and break
  // when we reach non-identical values e.g. 227-229, stop at i = 2
  while (i < from.length) {
    fromDigit = from[i]
    toDigit = to[i]

    if (fromDigit === toDigit) {
      i = i + 1
    } else {
      break
    }
  }

  // Now we need to check backwards from the final digit of 'from', and check
  // for zeroes. When we reach a non-zero digit, break.
  //  e.g. 200-203, stop at j = 2.
  let j = from.length - 1
  while (j > 0) {
    if (from[j] === '0') {
      j = j - 1
    } else {
      break
    }
  }

  // If 'from' ends in one or more zeroes, use j to slice 'to'
  if (j < from.length - 1) {
    return to.slice(j)
  } else { // use i to slice 'to'
    // First we need to check if from[i] and to[i] are 1 e.g. 212-18, keep 2 digits
    if (from[from.length - 2] === '1' && to[to.length - 2] === '1') {
      return to.slice(i - 1)
    } else {
      return to.slice(i)
    }
  }
}

function addPageReferenceFunc () {
  if (typeof Prince === 'object') {
    console.log('Adding page references in Prince.')
    Prince.addScriptFunc('pagereference', function (currentPage, targetPage) {
      // if the target is on this page, return blank
      if (currentPage === targetPage) {
        return ''
      }

      // otherwise show a space and the page number in parentheses
      return '\u00A0' + prePageNumberPhrase + targetPage + postPageNumberPhrase
    })

    // Add a page reference in a book index
    Prince.addScriptFunc('indexPageReference', function (page, entryPosition, prepend) {
      // If this is the first link in a new index entry,
      // reset the ebCurrentBookIndexPageNumber.
      if (entryPosition === 'first') {
        ebCurrentBookIndexPageNumber = ''
      }

      // If the page number isn't the ebCurrentBookIndexPageNumber,
      // return the page number for the target link.
      if (page !== ebCurrentBookIndexPageNumber) {
        // Run the function to elide the number if it's the end of a range
        let indexString = page
        if (entryPosition === 'to') {
          indexString = elidePageNumber(ebCurrentBookIndexPageNumber, page)
        }
        // Update the ebCurrentBookIndexPageNumber
        ebCurrentBookIndexPageNumber = page

        // Return the page plus any prepended string
        return prepend + indexString
      } else {
        // Otherwise, return an empty string.
        return ''
      }
    })
  }
}

export default function ebPageReference () {
  addPageReferenceFunc()
}
