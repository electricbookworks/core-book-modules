function ebStudentsRemoveSectionNumbers () {
  const sectionHeadings = document.querySelectorAll('h2')
  if (sectionHeadings.length > 0) {
    sectionHeadings.forEach(function (heading) {
      const headingLink = heading.querySelector('a')
      const target = headingLink || heading
      const numbersAndSuffix = /[\d.]+[ -]?/g
      target.innerHTML = target.innerHTML.replace(numbersAndSuffix, '')
      target.setAttribute('id', target.getAttribute('id')?.replace(numbersAndSuffix, '') || '')
    })
  }
}

function ebStudentsHideNavItems () {
  const hiddenNavItems = document.querySelectorAll('.nav-list .students-hidden, .toc-list .students-hidden')
  hiddenNavItems.forEach(function (item) {
    const expanderList = item.parentNode
    const expander = expanderList.previousElementSibling

    // Use parentNode.removeChild rather than Element.remove(): Prince's
    // built-in JS engine does not implement ChildNode.remove(), so calling
    // item.remove() in a PDF build throws 'remove': undefined is not a function.
    if (item.parentNode) {
      item.parentNode.removeChild(item)
    }

    // If the list now has no children, remove the expander,
    // after checking that we're targeting a list and expander
    if (expanderList && expander &&
                expanderList.tagName === 'OL' &&
                expander.tagName === 'BUTTON') {
      if (expanderList.children.length === 0 && expander.parentNode) {
        expander.parentNode.removeChild(expander)
      }
    }
  })
}

function ebStudentsRemoveEmptyTocLists () {
  // Some toc-list elements are generated empty, e.g. for a chapter
  // whose child entries are all 'students-hidden' and have been removed.
  // Empty <ol class="toc-list"> elements still take up space (margins),
  // so remove any that have no element children.
  const tocLists = document.querySelectorAll('ol.toc-list')
  tocLists.forEach(function (tocList) {
    if (tocList.children.length === 0 && tocList.parentNode) {
      // Use parentNode.removeChild rather than Element.remove(): Prince's
      // built-in JS engine does not implement ChildNode.remove().
      tocList.parentNode.removeChild(tocList)
    }
  })
}

export default function ebStudents () {
  ebStudentsRemoveSectionNumbers()
  ebStudentsHideNavItems()
  ebStudentsRemoveEmptyTocLists()
}
