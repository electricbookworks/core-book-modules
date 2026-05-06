// Sometimes we need to move elements to the bottom of the page on web and app,
// but kramdown puts the footnotes below anything that appears in the markdown file.
// This code moves the selected elements below the footnotes div, if there is one

export default function ebMoveBelowFootnotes (selector = '.box.citation') {
  const elementsToMove = document.querySelectorAll(selector)
  const footnoteDiv = document.querySelector('.footnotes')

  if (elementsToMove && footnoteDiv) {
    [...elementsToMove].reverse().forEach(function (element) {
      footnoteDiv.insertAdjacentElement('afterend', element)
    })
  }
}
