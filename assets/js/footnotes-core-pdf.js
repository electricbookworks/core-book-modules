export default function ebCorePdf () {
  // List the features we use.
  // (Both classList and forEach gave us problems
  // with Prince, so we don't use them here)
  const featuresSupported = navigator.userAgent.indexOf('Opera Mini') === -1 &&
    'querySelector' in document

  // Early exit for unsupported
  if (!featuresSupported) return

  // Exit if we're in Phantom, to avoid duplicate footnote-detail.
  // Phantom is legacy code no longer used, so this is kept for
  // unlikely backward-compatibility reasons.
  if (typeof window.callPhantom === 'function') return

  // Get all the content wrappers
  const wrappers = document.querySelectorAll('.wrapper')

  // For each wrapper, loop through footnotes
  let wrapper
  for (wrapper = 0; wrapper < wrappers.length; wrapper += 1) {
    // Get all the `.footnote`s
    const footnoteLinks = wrappers[wrapper].querySelectorAll('.footnote')

    // Skip this wrapper if there are no footnotes
    if (footnoteLinks.length === 0) {
      continue
    }

    // Loop through this wrapper's footnotes
    for (let i = 0; i < footnoteLinks.length; i += 1) {
      // Get the target ID
      let targetID = footnoteLinks[i].hash

      // Skip this one if footnotes should be at the end of the doc
      if (footnoteLinks[i].closest('.wrapper.footnotes-at-end')) {
        continue
      }

      // NOTE: Prince's .hash behaviour is unusual: it strips the # out
      // So, let's use getElementById instead of querySelector
      // If it starts with a hash, chop it out
      if (targetID.indexOf('#') === 0) {
        targetID = targetID.replace('#', '')
      }

      // Find the li with the ID from the .footnote's href
      // and get the contents
      const targetReference = document.getElementById(targetID)

      // Make a div.reference
      const footnoteContainer = document.createElement('div')
      footnoteContainer.className += ' footnote-detail'
      footnoteContainer.id = targetID

      // Get the container element
      const containingElement = footnoteLinks[i].parentNode.parentNode

      // If it's in a sidenote, put it after,
      // otherwise put it before, for print-styling reasons
      if (containingElement.parentNode.className.indexOf('sidenote') >= 0) {
        containingElement.appendChild(footnoteContainer)

        // Also add class noting where the footnote is
        footnoteContainer.className += ' footnote-detail-after'
      } else {
        containingElement.parentNode
          .insertBefore(footnoteContainer, containingElement)

        // Also add class noting where the footnote is
        footnoteContainer.className += ' footnote-detail-before'
      }

      // Move the li contents inside the div.reference
      footnoteContainer.innerHTML = targetReference.innerHTML

      // Add a class to the parent
      containingElement.parentNode.className += ' contains-footnote'

      // Get some  elements related to this foonote
      const footnotesList = wrappers[wrapper].querySelector('.footnotes')
      const contentWantsFootnotes = footnoteLinks[i].closest('.wrapper.footnotes-at-end')

      // Remove the footnotes div if we're done with it.
      // If `.footnotes-at-end`, then we've already skipped
      // a .footnote and `i` will never equal `footnoteLinks.length - 1`
      // and the footnotes div will not be removed here anyway.
      // But we check for !contentWantsFootnotes to be thorough.
      if (i === footnoteLinks.length - 1) {
        if (footnotesList && !contentWantsFootnotes) {
          // Prince does not support remove(), so instead
          // we use removeChild() via the parentNode.
          footnotesList.parentNode.removeChild(footnotesList)
        }
      }
    }
  }
}
