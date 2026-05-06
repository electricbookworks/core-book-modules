/* global MutationObserver */

const settings = process.env.settings

function ebStudentsRemoveSectionNumbers () {
  const sectionHeadings = document.querySelectorAll('h2')
  if (sectionHeadings.length > 0) {
    sectionHeadings.forEach(function (heading) {
      // The first anchor tag contains the number
      const headingLink = heading.querySelector('a')
      if (headingLink) {
        // Replace only the leading section number
        const newHeadingLinkHTML = headingLink.innerHTML.replace(/[0-9.]+/, '')
        headingLink.innerHTML = newHeadingLinkHTML
      } else {
        // in print there is no a, we want the innerHTML of the h2 to change
        const newHeadingInnerHTML = heading.innerHTML.replace(/[0-9.]+/, '')
        heading.innerHTML = newHeadingInnerHTML
      }
    })
  }
}

function ebStudentsHideNavItems () {
  const hiddenNavItems = document.querySelectorAll('.nav-list .students-hidden, .toc-list .students-hidden')
  hiddenNavItems.forEach(function (item) {
    const expanderList = item.parentNode
    const expander = expanderList.previousElementSibling
    item.remove()

    // If the list now has no children, remove the expander,
    // after checking that we're targeting a list and expander
    if (expanderList && expander &&
                expanderList.tagName === 'OL' &&
                expander.tagName === 'BUTTON') {
      if (expanderList.children.length === 0) {
        expander.remove()
      }
    }
  })
}

function ebStudentNumbersWaitForAccordion () {
  // Need to wait for the accordion to load, before we manipulating the sections

  const accordionWaiter = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes') {
        if (document.body.getAttribute('data-accordion-active') === 'true') {
          ebStudentsRemoveSectionNumbers()
        }
      }
    })
  })

  accordionWaiter.observe(document.body, { attributes: true })
}

export default function ebStudents () {
  if (process.env.output === 'web' || process.env.output === 'app') {
    // We need to wait for the accordion to load
    ebStudentNumbersWaitForAccordion()
    ebStudentsHideNavItems()
  } else {
    // For PDFs, we don't need to wait for the accordion
    ebStudentsRemoveSectionNumbers()
    ebStudentsHideNavItems()
  }
}
