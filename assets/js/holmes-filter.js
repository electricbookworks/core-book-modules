/* global requestAnimationFrame */

import { locales, pageLanguage } from './locales'
import holmes from 'holmes.js'

// This file allows us to use holmes to filter data lists
// in the book. The filterFactory can be used to create
// a filter instance for each data list, and then if we're
// on a page with that list (index, glossary, etc), an input
// box will be added to the page for filtering.

// NOTE: Currently, only one holmes filter instance can be
// added per page. This will need to be adjusted if needed in
// the future.

const filterFactory = (selector, input, find) => {
  return {
    selector,
    input,
    find,
    addFilter () {
      const dataList = document.querySelector(this.selector)
      if (dataList) {
        // Add a filter text box to the page
        ebAddFilterInput(this.selector, this.input)
        runHolmes(this.input, this.find)
      }
    }
  }
}

const runHolmes = function (input, find) {
  const holmesInstance = holmes({
    input,
    find,
    class: {
      hidden: 'filter-hidden'
    }
  })
  // holmes.js registers a DOMContentLoaded listener to call start(),
  // but if that event already fired, start() never runs.
  if (document.readyState !== 'loading') {
    holmesInstance.start()
  }
}

// Add a filter to the page
function ebAddFilterInput (selector, input) {
  const dataToFilter = document.querySelector(selector)
  if (dataToFilter) {
    // Create filter input element
    const filterElement = document.createElement('input')
    filterElement.setAttribute('type', 'text')
    filterElement.classList.add(input.replace('.', ''))
    filterElement.classList.add('filter-input')
    filterElement.setAttribute('autofocus', 'autofocus')

    if (locales[pageLanguage].filter.placeholder) {
      filterElement.setAttribute('placeholder', locales[pageLanguage].filter.placeholder)
    }

    // Insert the filter before the data list
    dataToFilter.insertAdjacentElement('beforebegin', filterElement)

    // Clear the input when there is a hash change on the page, so that glossary
    // cross-references aren't hidden by the filter when they are clicked
    window.addEventListener('hashchange', function (event) {
      event.preventDefault()

      // Clear the filter
      filterElement.value = ''
      const clearEvent = new Event('input')
      clearEvent.inputType = 'insertText'
      filterElement.dispatchEvent(clearEvent)

      // Then navigate to the clicked element
      // eslint-disable-next-line no-self-assign
      window.location.hash = window.location.hash
    })
  }
}

// When a parent li is visible after filtering,
// ensure its nested child li elements stay visible too.
function ebPreserveChildVisibility (listSelector, inputSelector) {
  const list = document.querySelector(listSelector)
  const filterInput = document.querySelector(inputSelector)
  if (!list || !filterInput) return

  filterInput.addEventListener('input', function () {
    requestAnimationFrame(function () {
      list.querySelectorAll('li:not(.filter-hidden)').forEach(function (visibleLi) {
        visibleLi.querySelectorAll('li.filter-hidden').forEach(function (childLi) {
          childLi.classList.remove('filter-hidden')
        })
      })
    })
  })
}

export default function ebHolmesFilter () {
  // Add glossary filter
  // Filter the dt elements in the .glossary list
  const glossaryFilter = filterFactory('.glossary', '.glossary-filter', 'dt')
  glossaryFilter.addFilter()

  // Add index filter
  // Filter the li element in the .reference-index list
  const indexFilter = filterFactory('.reference-index', '.index-filter', '.reference-index li')
  indexFilter.addFilter()

  // Keep child items visible when their parent matches the filter
  ebPreserveChildVisibility('.reference-index', '.index-filter')
}
