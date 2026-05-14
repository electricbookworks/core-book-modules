/* global window */

const ebDefinitionsInit = function () {
  // check for browser support of the features we use
  return navigator.userAgent.indexOf('Opera Mini') === -1 &&
            document.querySelector !== undefined &&
            window.addEventListener !== undefined &&
            !!Array.prototype.forEach
}

const ebDefinitionsSlugify = function (snail) {
  return snail.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text;
}

const ebConvertToAnchorTag = function (element) {
  // Thanks https://stackoverflow.com/a/34237781/1781075
  function cloneAttributes (element, sourceNode) {
    let attr
    const attributes = Array.prototype.slice.call(sourceNode.attributes)
    // While attr can be set to the last attribute in attributes
    // (i.e. there is still an attribute in attributes to copy),
    // set that attribute on the element. (Note, we really do want
    // to try to set the value of attr here, not test if it equals anything.)
    while ((attr = attributes.pop())) {
      element.setAttribute(attr.nodeName, attr.nodeValue)
    }
  }

  // Make it an anchor tag, not a strong span
  const newElement = document.createElement('a')
  newElement.innerHTML = element.innerHTML
  cloneAttributes(newElement, element)
  element.parentNode.replaceChild(newElement, element)
  return newElement
}

const ebDefinitionsMoveDefinitions = function () {
  // get all the definition-terms and loop over them
  const definitionTerms = document.querySelectorAll('.definition-term')

  // loop over them
  definitionTerms.forEach(function (definitionTerm) {
    // visually hide the old dl, the parent of the definitionTerm
    definitionTerm.parentNode.classList.add('hidden-definition-list')

    // get the definition term
    let definitionTermText = definitionTerm.innerHTML

    // Detect presence of em spans. Note that em spans may include attributes,
    // so only test for <em, not <em>.
    let definitionTermTextIsItalic
    if (definitionTermText.indexOf('<em') !== -1) {
      // console.log(definitionTermText + ' contains italics.');
      definitionTermTextIsItalic = true
    }

    // Create a plain-text version of definitionTermText for matching with dataTermInText
    let termTextForMatching = definitionTermText
    // 1. Remove em spans created from asterisks in markdown
    if (definitionTermTextIsItalic) {
      termTextForMatching = termTextForMatching.replace(/(<([^>]+)>)/ig, '*')
    }
    // 2. Straighten quotes in the HTML to match data-terms
    termTextForMatching = termTextForMatching.replace('’', "'")
    termTextForMatching = termTextForMatching.replace('‘', "'")
    // console.log('termTextForMatching: ' + termTextForMatching);

    // to check that we even have any terms to define:
    // find a data-term attribute
    const dataTermInText = document.querySelector('[data-term="' + termTextForMatching + '"]')
    // check that we have the term in the text
    if (!dataTermInText) {
      return
    }

    // now we can add popups to each of them

    // find all the places where we want a popup
    const dataTermsInText = document.querySelectorAll('[data-term="' + termTextForMatching + '"]')

    // for each one, get the description and add the popup
    dataTermsInText.forEach(function (dataTermInText) {
      // if the term contained italics, put the em tags back
      if (definitionTermTextIsItalic) {
        definitionTermText = termTextForMatching.replace(/\*(.+?)\*/ig, '<em>$1</em>')
      }

      // Style the term (we do this here so that this styling only applies if JS
      // loads and runs, to avoid making a term look like a link that doesn't work)
      dataTermInText.classList.add('data-term-clickable')

      // get the description text
      const definitionDescriptionText = definitionTerm.nextElementSibling.innerHTML

      // add it after the data-term
      const definitionPopup = document.createElement('span')
      definitionPopup.innerHTML = '<span class="definition-hover-term">' + definitionTermText + '</span>' + ' ' + definitionDescriptionText
      definitionPopup.classList.add('visuallyhidden')
      definitionPopup.classList.add('definition-description-hover')

      // This can cause duplicate IDs on pages with repeated definitions,
      // should it be removed, along with ebDefinitionsSlugify?
      definitionPopup.id = 'dd-' + ebDefinitionsSlugify(definitionTermText)

      dataTermInText.insertAdjacentElement('afterEnd', definitionPopup)

      // Add a Word Joiner (zero-width non-breaking space) after the definition popup,
      // to ensure that any punctuation after a definition term reflows correctly.
      definitionPopup.insertAdjacentHTML('afterEnd', '&#8288;')

      // add the closing X as a link
      const closeButton = document.createElement('button')
      closeButton.classList.add('close')
      closeButton.innerHTML = '<span class="visuallyhidden">close</span>'
      definitionPopup.appendChild(closeButton)

      // Convert to anchor tag
      ebConvertToAnchorTag(dataTermInText)
    })
  })
}

const ebDefinitionsShowDescriptions = function () {
  // get the terms
  const dataTerms = document.querySelectorAll('[data-term]')

  // loop and listen for hover on child description
  dataTerms.forEach(function (dataTerm) {
    // get the child that we want to pop up
    const childPopup = dataTerm.nextElementSibling

    // show on click
    dataTerm.addEventListener('click', function () {
      childPopup.classList.remove('visuallyhidden')
    })
  })
}

const ebDefinitionsHideDescriptionWithButton = function () {
  const closeButtons = document.querySelectorAll('.definition-description-hover button.close')

  // listen for clicks on all close buttons
  closeButtons.forEach(function (closeButton) {
    closeButton.addEventListener('click', function () {
      // ev.preventDefault();
      closeButton.parentNode.classList.add('visuallyhidden')
    })
  })
}

const ebDefinitions = function () {
  // early exit for lack of browser support
  if (!ebDefinitionsInit()) {
    return
  }

  // move all the definitions next to their terms
  ebDefinitionsMoveDefinitions()

  // listen for hover and things
  ebDefinitionsShowDescriptions()

  // 20230130 - don't let definitions close automatically in EPUB
  // ebDefinitionsHideDescriptions();
  ebDefinitionsHideDescriptionWithButton()
}

ebDefinitions()
