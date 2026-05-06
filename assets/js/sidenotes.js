// Detect long sidenotes and make them 'web'wide
// console.log('Debugging sidenotes.js...');

// Options:
// length: min characters to convert to .web-wide
// elements: which elements are sidenotes? Use CSS selectors
// siblings: which elements can wrap around web-wide sidenotes? Use tag names only.
const options = {
  length: '300',
  elements: '.sidenote, .info',
  siblings: 'p, ol, ul, dl, h3, h4, h5'
}

// Get all the sidenotes
function ebSidenoteConverterAllSidenotes () {
  const sidenotes = document.querySelectorAll(options.elements)
  // console.log('Found ' + sidenotes.length + ' sidenotes.');
  return sidenotes
}

// Get a sidenote's length
function ebSidenoteConverterSidenoteLength (sidenote) {
  const length = sidenote.innerText.length
  return length
}

// Check if an element is in the list of allowed siblings
function ebSidenoteConverterIsAllowedAsSibling (element) {
  // console.log('Checking whether ' + element.tagName + ' can wrap this sidenote.');

  // Get the allowed siblings list, remove spaces,
  // convert to uppercase to match tagNames,
  // and split it into an object.
  let allowedSiblings = options.siblings
  allowedSiblings = allowedSiblings.replace(/\s/g, '')
  allowedSiblings = allowedSiblings.toUpperCase()
  allowedSiblings = allowedSiblings.split(',')

  // Check if the element is in the allowedSiblings object.
  if (Object.values(allowedSiblings).indexOf(element.tagName) > -1) {
    // console.log('Yes, ' + element.tagName + ' can wrap a sidenote.');
    return true
  }
}

// Add 'web-wide' class
function ebSidenoteConverterAddClass (sidenote) {
  // console.log('Adding "web-wide" class to sidenote: "' + sidenote.innerText + '"');
  // In some instances, we want to override this behaviour, so let's check for that class
  if (sidenote.classList.contains('no-web-wide') || sidenote.classList.contains('link-to-component')) {
    return sidenote
  }

  // Also, we don't want web-wide sidenotes to be on the left,
  // so also add the web-sidenote-right class.
  sidenote = sidenote.classList.add('web-wide', 'web-sidenote-right')

  return sidenote
}

// Recursively check the siblings of the sidenote
// to see if they can safely wrap around the sidenote.
function ebSidenoteConverterWrapText (sidenote, element, sidenoteLength, nextElementsLength) {
  if (element.nextElementSibling) {
    if (ebSidenoteConverterIsAllowedAsSibling(element.nextElementSibling)) {
      // console.log('This next element can wrap a sidenote: ' + element.nextElementSibling.innerText);
      nextElementsLength = nextElementsLength + element.nextElementSibling.innerText.length
      if (nextElementsLength > sidenoteLength) {
        // console.log('Following elements are long enough.');
        ebSidenoteConverterAddClass(sidenote)
      } else {
        ebSidenoteConverterWrapText(sidenote, element.nextElementSibling, sidenoteLength, nextElementsLength)
      }
    }
  }
}

function ebShiftSidenote (sidenote, sibling, screenWidthNarrow, screenWidthWide) {
  // Sidenotes that have '.web-full-width' should stay where they are
  if (sidenote.classList.contains('web-full-width')) {
    return
  }

  // info boxes and sidenotes in expandable boxes use a different breakpoint
  let breakpoint
  if (sidenote.closest('.expandable-box') || sidenote.classList.contains('info')) {
    breakpoint = screenWidthWide
  } else {
    breakpoint = screenWidthNarrow
  }

  if (sidenote.classList.contains('shifted') && breakpoint.matches) {
    // If we move wider than the breakpoint, and the sidenote has already been
    // shifted below its next visible sibling, move it up above the sibling
    // again so that it floats correctly
    const sidenotePlaceholder = document.getElementById(sidenote.getAttribute('data-fingerprint'))
    sidenote.classList.remove('shifted')
    sidenotePlaceholder.replaceWith(sidenote)
  } else if (!breakpoint.matches && !sidenote.classList.contains('keep-above')) {
    // Else if we move narrower than the breakpoint, shift the sidenote below its
    // next visible sibling, and pop a placeholder in its place so that we know
    // where it came from
    sidenote.classList.add('shifted')
    const sidenotePlaceholder = document.createElement('div')
    sidenotePlaceholder.id = sidenote.getAttribute('data-fingerprint')
    sidenote.insertAdjacentElement('afterend', sidenotePlaceholder)
    sibling.insertAdjacentElement('afterend', sidenote)
  }
}

// The main process
function ebSidenoteConverterProcess () {
  const sidenotes = ebSidenoteConverterAllSidenotes()

  sidenotes.forEach(function (sidenote) {
    const sidenoteLength = ebSidenoteConverterSidenoteLength(sidenote)

    if (sidenoteLength > options.length) {
      ebSidenoteConverterWrapText(sidenote, sidenote, sidenoteLength, 0)
    }

    // Sidenotes that are not floated need to be moved down one space on the page,
    // so that on narrow screens, they are _below_ the element next to which
    // they would be floated on wider screens, preserving sensible reading order

    // We use the fingerprint to distinguish individual sidenotes, as they don't
    // received ids
    const sidenoteFP = sidenote.getAttribute('data-fingerprint')

    // We want to move the sidenote below the next _visible_ sibling, rather than
    // the next element sibling, in case the next element sibling is invisible
    // (e.g. indexing tag, comment)
    const nextVisibleSibling = document.querySelector(`
      [data-fingerprint="${sidenoteFP}"] ~ p,
      [data-fingerprint="${sidenoteFP}"] ~ ol,
      [data-fingerprint="${sidenoteFP}"] ~ ul,
      [data-fingerprint="${sidenoteFP}"] ~ h3,
      [data-fingerprint="${sidenoteFP}"] ~ h4,
      [data-fingerprint="${sidenoteFP}"] ~ h5,
      [data-fingerprint="${sidenoteFP}"] ~ dl:not(.definition)
    `)

    // 640px = 40em = $break-point-m for regular sidenotes
    // 1280px = 80em = $break-point-xl for sidenotes in expandable boxes
    const screenWidthNarrow = window.matchMedia('(min-width: 640px)')
    const screenWidthWide = window.matchMedia('(min-width: 1280px)')

    // Initially move the sidenote down if needed
    ebShiftSidenote(sidenote, nextVisibleSibling, screenWidthNarrow, screenWidthWide)

    // Watch for changes in screenwidth, move it back up if there is room for it
    // to float into the margin
    screenWidthNarrow.addEventListener('change', function () {
      ebShiftSidenote(sidenote, nextVisibleSibling, screenWidthNarrow, screenWidthWide)
    })
    screenWidthWide.addEventListener('change', function () {
      ebShiftSidenote(sidenote, nextVisibleSibling, screenWidthNarrow, screenWidthWide)
    })
  })
}

export default function ebSidenotes () {
  ebSidenoteConverterProcess()
}
