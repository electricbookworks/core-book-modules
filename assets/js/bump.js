// Bumps an element one up the DOM.

function findPrevious (elm) {
  do {
    elm = elm.previousSibling
  } while (elm && elm.nodeType !== 1)
  return elm
}

function bumpUp (elm) {
  const previous = findPrevious(elm)
  if (previous) {
    elm.parentNode.insertBefore(elm, previous)
  }
}

export default function ebBump () {
  window.onload = function () {
    const elementsToBumpUp = document.querySelectorAll('.bump-up')
    let i
    for (i = 0; i < elementsToBumpUp.length; i += 1) {
      bumpUp(elementsToBumpUp[i])
    }
  }
}
