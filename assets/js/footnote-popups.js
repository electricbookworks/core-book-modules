import { locales, pageLanguage } from './locales'

function ebFootnotePopups () {
  // List the features we use
  const featuresSupported = navigator.userAgent.indexOf('Opera Mini') === -1 &&
            document.querySelector !== 'undefined' &&
            window.addEventListener !== 'undefined' &&
            !!Array.prototype.forEach

  // Get all the .footnote s
  const footnoteLinks = document.querySelectorAll('.footnote')

  // Early exit for unsupported or if there are no footnotes
  if (!featuresSupported || footnoteLinks.length === 0) {
    return
  }

  // Loop through footnotes
  footnoteLinks.forEach(function (current) {
    // get the target ID
    const targetHash = current.hash
    const targetID = current.hash.replace('#', '')

    // escape it with double backslashes, for querySelector
    const sanitisedTargetHash = targetHash.replace(':', '\\:')

    // find the li with the ID from the .footnote's href
    const targetReference = document.querySelector(sanitisedTargetHash)

    // make a div.reference
    const footnoteContainer = document.createElement('div')
    footnoteContainer.classList.add('footnote-detail')
    footnoteContainer.classList.add('visuallyhidden')
    footnoteContainer.setAttribute('data-bookmarkable', 'no')
    footnoteContainer.setAttribute('role', 'doc-footnote')
    footnoteContainer.id = 'inline-' + targetID

    // the a, up to the sup
    const theSup = current.parentNode
    const theContainingElement = current.parentNode.parentNode

    // add the reference div after the footnote reference
    theSup.insertAdjacentElement('afterend', footnoteContainer)

    // move the li contents inside the div.reference
    footnoteContainer.innerHTML = targetReference.innerHTML

    // now that we have duplicated the contents of the footnote, remove the
    // duplicated ID to improve accessibility
    const footnoteElements = footnoteContainer.querySelectorAll('[id]')
    footnoteElements.forEach(function (element) {
      if (element.getAttribute('id')) {
        element.removeAttribute('id')
      }
    })

    // The superscript is given role=doc-noteref by kramdown, but this needs
    // to be removed as it is deprecated
    if (theSup.getAttribute('role', 'doc-noteref') &&
            theSup.querySelector('a')) {
      theSup.removeAttribute('role', 'doc-noteref')
    }

    // show on hover
    theSup.addEventListener('mouseover', function (ev) {
      if (ev.target.classList.contains('footnote')) {
        footnoteContainer.classList.remove('visuallyhidden')
      }
    })
    // Make superscript keyboard focusable
    theSup.setAttribute('tabindex', 0)
    // Make contents of footnote not keyboard focusable initially
    const tabbableElements = footnoteContainer.querySelectorAll('a')
    tabbableElements.forEach(function (el) {
      el.setAttribute('tabindex', '-1')
    })

    // Open footnote when focused and Enter is pressed
    theSup.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        footnoteContainer.classList.toggle('visuallyhidden')
        tabbableElements.forEach(function (el) {
          el.removeAttribute('tabindex')
        })
      }
    })

    // add a class to the parent
    theContainingElement.parentNode.classList.add('contains-footnote')

    // if we mouseleave footnoteContainer, hide it
    // (mouseout also fires on mouseout of children, so we use mouseleave)
    footnoteContainer.addEventListener('mouseleave', function (ev) {
      if (ev.target === this) {
        setTimeout(function () {
          footnoteContainer.classList.add('visuallyhidden')
        }, 1000)
      }
    })
    // Close footnote if Esc key is pressed
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' &&
                !footnoteContainer.classList.contains('visuallyhidden')) {
        footnoteContainer.classList.add('visuallyhidden')
        tabbableElements.forEach(function (el) {
          el.setAttribute('tabindex', '-1')
        })
      }
    })

    // Clicking on the reverseFootnote link closes the footnote
    const reverseFootnote = footnoteContainer.querySelector('.reversefootnote')

    // remove the contents since we're using
    // CSS and :before to show a close button marker
    reverseFootnote.innerText = ''

    // Add hidden link text for screen readers
    const closeFootnoteLabel = document.createElement('span')
    closeFootnoteLabel.classList.add('visuallyhidden')
    closeFootnoteLabel.innerText = locales[pageLanguage].footnotes['close-footnote']
    reverseFootnote.appendChild(closeFootnoteLabel)

    reverseFootnote.addEventListener('click', function (ev) {
      ev.preventDefault()
      footnoteContainer.classList.add('visuallyhidden')
    })

    // remove the href to avoiding jumping down the page
    current.removeAttribute('href')
  })

  // Format the footnotes at the bottom of the page
  const footnoteItems = document.querySelectorAll('.footnotes a.reversefootnote')
  const reverseFootnoteAlt = locales[pageLanguage].footnotes['reversefootnote-alt']

  function reverseFootnoteSVGElement () {
    const reversefootnoteArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    reversefootnoteArrow.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    reversefootnoteArrow.setAttribute('viewBox', '0 0 28 24.12')
    reversefootnoteArrow.setAttribute('width', '28')
    reversefootnoteArrow.setAttribute('height', '24.12')
    reversefootnoteArrow.setAttribute('class', 'reverse-footnote-arrow')
    reversefootnoteArrow.innerHTML = '<title>' + reverseFootnoteAlt + '</title><path d="M2.69 14L8.6 8.09V13h10.28A4.21 4.21 0 0022 11.7a4.24 4.24 0 001.28-3.1A4.24 4.24 0 0022 5.5a4.21 4.21 0 00-3.11-1.29h-.33v-2h.33a6.14 6.14 0 014.54 1.88 6.17 6.17 0 011.86 4.51 6.17 6.17 0 01-1.87 4.53A6.14 6.14 0 0118.88 15H8.6v4.9z" fill="gray"/>'
    return reversefootnoteArrow
  }

  footnoteItems.forEach(function (reverseFootnoteLink) {
    reverseFootnoteLink.innerHTML = ''
    reverseFootnoteLink.appendChild(reverseFootnoteSVGElement())
  })

  // Kramdown is adding role=doc-endnote to the list items
  // but this is deprecated and needs to be removed

  const footnoteLIs = document.querySelectorAll('div.footnotes li')
  footnoteLIs.forEach(function (li) {
    if (li.getAttribute('role', 'doc-endnote')) {
      li.removeAttribute('role', 'doc-endnote')
    }
  })
}

export default ebFootnotePopups
