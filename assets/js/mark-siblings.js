// In CSS we can't target an unknown element
// that precedes a known element. So this script
// marks the preceding siblings of certain elements
// so that we can target them. Similar to mark-parents.js.

export default function ebMarkSiblings (querySelectorString = 'ol, ul') {
  const followingSiblings = document.querySelectorAll(querySelectorString)
  followingSiblings.forEach(function (element) {
    if (element.previousElementSibling) {
      const prefix = element.tagName.toLowerCase()
      element.previousElementSibling.classList.add('previous-sibling-of-' + prefix)
    }
  })
}
