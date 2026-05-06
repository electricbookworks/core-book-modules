// This function moves all endnotes to the back of the book
export default function ebEndnotesCore () {
  const allEndnoteDivs = document.querySelectorAll('.footnotes')

  // An array to store all the endnotes in,
  // which we'll copy to the back of the book.
  const allEndnoteListItems = []

  // Get all the endnotes with visible footnote references
  // and copy them to the allEndnoteListItems array.
  allEndnoteDivs.forEach(function (endnoteDiv) {
    const listItems = endnoteDiv.querySelectorAll('li')
    listItems.forEach(function (item) {
      // Unless this is in an extension, which is hidden,
      // include it in the array of book endnotes
      const footnoteLink = document.querySelector('[href="#' + item.id + '"]')
      if (!footnoteLink.closest('.expandable-box.extension')) {
        allEndnoteListItems.push(item)
      }
    })

    // Remove the div we don't need any more.
    // (Prince doesn't support remove().)
    endnoteDiv.parentNode.removeChild(endnoteDiv)
  })

  // Create one big endnotes section for the book
  const bookEndnotesDiv = document.createElement('div')
  bookEndnotesDiv.classList.add('footnotes')
  bookEndnotesDiv.classList.add('book-endnotes')

  // Find the div.wrapper that till contain the endnotes
  // (i.e. the markdown document with `style: endnotes`)
  // and append the new bookEndnotesDiv to it.
  const bookEndnotesWrapper = document.querySelector('.wrapper.endnotes')
  bookEndnotesWrapper.appendChild(bookEndnotesDiv)

  // Create a new list for our endnote list items
  const bookEndnotesList = document.createElement('ol')
  bookEndnotesDiv.appendChild(bookEndnotesList)

  // Add each list item to the new list.
  allEndnoteListItems.forEach(function (item) {
    bookEndnotesList.appendChild(item)
  })

  // Flag that footnotes are at the end,
  // so that CSS displays the footnote references.
  document.body.classList.add('footnotes-at-end')

  // Renumber all endnote references in the text
  const endnotesReferences = document.querySelectorAll('sup a.footnote')
  let startNumber = 1

  endnotesReferences.forEach(function (reference) {
    // Unless this is not visible, give it a new number
    if (!reference.closest('.expandable-box.extension')) {
      reference.innerHTML = startNumber
      startNumber += 1
    }
  })
}
