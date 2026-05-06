import { locales, pageLanguage } from './locales'

function ebComponentShareLinks (href) {
  // Need to edit all of the links in the share menu,
  // so that sharing links include all of the extra parameters
  // and people can share the "component view".

  // This is the URL currently used. We need to replace this
  const shareURL = window.location.origin + window.location.pathname
  const pageURL = encodeURIComponent(href)

  // Now where do we need to replace this?
  const shareLinks = document.querySelectorAll('a.share-link-content')

  shareLinks.forEach(function (link) {
    let hrefText = link.href
    hrefText = hrefText.replace(shareURL, pageURL)
    link.href = hrefText
  })

  // And also in the copy link
  const copyLink = document.querySelector('span.copy-to-clipboard')
  copyLink.setAttribute('data-copy-text', pageURL)
}

function ebComponentBuildRangeString (sectionString) {
  const formattedRanges = []

  // First split into contiguous ranges
  const sectionRanges = sectionString.split('~')

  // Then get the first and last section in each range, format, and join with -
  sectionRanges.forEach(function (range) {
    const sections = range.split('>')
    // Use Set to account for single section "ranges"
    const endSections = [...new Set([sections[0], sections[sections.length - 1]])]

    // Pull out section and unit numbers from section filenames and join with .
    const sectionNumbers = endSections.map(function (string) {
      return Array.from(string.matchAll(/\d\d/g), (s) => { return s[0].replace(/^0/, '') }).join('.')
    })

    formattedRanges.push(sectionNumbers.join('–'))
  })

  if (formattedRanges.length > 1 || formattedRanges.find(range => range.includes('–'))) {
    return locales[pageLanguage].components.sections + ' ' + formattedRanges.join(', ')
  } else {
    return locales[pageLanguage].components.section + ' ' + formattedRanges.join(', ')
  }
}

function ebComponentBuildSubtitle (href) {
  let subtitle = locales[pageLanguage].project['formatted-name']
  const folder = (window.location.pathname.includes('microeconomics'))
    ? `<em>${locales[pageLanguage].volumes.microeconomics}</em>`
    : `<em>${locales[pageLanguage].volumes.macroeconomics}</em>`
  subtitle += ': ' + folder

  // Now we need to add the section number(s) to the subtitle
  const sectionString = ebGetComponentParameters(href).sections
  const rangeString = ebComponentBuildRangeString(sectionString)
  subtitle += locales[pageLanguage].components.separator + rangeString

  return subtitle
}

function ebComponentAddTitle (href) {
  // Get the title from the data object
  const componentTitle = ebGetComponentParameters(href).title

  // Create some elements to add the title to the page
  const componentTitleWrapper = document.createElement('div')
  componentTitleWrapper.classList.add('component-title-wrapper')

  const componentTitleDiv = document.createElement('div')
  componentTitleDiv.classList.add('component-title')

  const componentTitleText = document.createElement('p')
  componentTitleText.innerHTML = componentTitle

  componentTitleDiv.appendChild(componentTitleText)
  componentTitleDiv.appendChild(ebComponentAddCloseButton(href))
  componentTitleWrapper.appendChild(componentTitleDiv)

  // Create the subtitle from the pieces
  const componentSubtitle = document.createElement('p')
  componentSubtitle.innerHTML = ebComponentBuildSubtitle(href)
  componentSubtitle.classList.add('component-subtitle')
  componentTitleWrapper.appendChild(componentSubtitle)

  const contentDiv = document.querySelector('.content')
  contentDiv.insertAdjacentElement('beforebegin', componentTitleWrapper)
}

function ebComponentAddCloseButton (href) {
  // The button is actually a hyperlink that takes the reader back to the sidenote
  // where they clicked on the component link

  const fromFile = ebGetComponentParameters(href).from
  const fromID = ebGetComponentParameters(href).id

  const buttonHref = fromFile + fromID

  const closeButton = document.createElement('a')
  closeButton.classList.add('component-close-button')
  closeButton.classList.add('button')
  closeButton.innerHTML = '×'
  closeButton.href = buttonHref

  return closeButton
}

function ebComponentNext (thisSection, nextSection) {
  // Create a next arrow

  const nextArrow = document.createElement('a')
  nextArrow.innerHTML = '＞'
  nextArrow.href = window.location.href.replace(thisSection, nextSection)
  nextArrow.href = nextArrow.href.split('#')[0]
  nextArrow.classList.add('component-next')
  nextArrow.setAttribute('aria-label', 'Next section')

  return nextArrow
}

function ebComponentPrevious (thisSection, previousSection) {
  // Create a previous arrow

  const previousArrow = document.createElement('a')
  previousArrow.innerHTML = '＜'
  previousArrow.href = window.location.href.replace(thisSection, previousSection)
  previousArrow.href = previousArrow.href.split('#')[0]
  previousArrow.classList.add('component-previous')
  previousArrow.setAttribute('aria-label', 'Previous section')

  return previousArrow
}

function ebComponentPaginationText (sectionList, thisIndex) {
  const numOfSections = sectionList.length
  const numOfThisSection = thisIndex + 1

  const paginationText = document.createElement('p')
  const sectionText = locales[pageLanguage].components.section
  const ofText = locales[pageLanguage].components.of
  paginationText.innerText = `${sectionText} ${numOfThisSection} ${ofText} ${numOfSections}`

  return paginationText
}

function ebComponentPaginationArrows (sectionList, thisSection, thisIndex) {
  const arrowWrapper = document.createElement('div')
  arrowWrapper.classList.add('component-pagination-arrows')

  let previousSection = ''
  let nextSection = ''
  let nextArrow = ''
  let previousArrow = ''

  const paginationText = ebComponentPaginationText(sectionList, thisIndex)

  if (thisIndex !== 0) {
    previousSection = sectionList[thisIndex - 1]
    previousArrow = ebComponentPrevious(thisSection, previousSection)
  }
  if (thisIndex !== sectionList.length - 1) {
    nextSection = sectionList[thisIndex + 1]
    nextArrow = ebComponentNext(thisSection, nextSection)
  }

  if (previousSection) {
    arrowWrapper.appendChild(previousArrow)
  }
  arrowWrapper.appendChild(paginationText)
  if (nextSection) {
    arrowWrapper.appendChild(nextArrow)
  }

  const titleDiv = document.querySelector('.component-title-wrapper')
  titleDiv.insertAdjacentElement('afterend', arrowWrapper)
}

function ebComponentPaginationDots (sectionList, thisSection, thisIndex) {
  // Make a wrapper for the dots
  const dotWrapper = document.createElement('div')
  dotWrapper.classList.add('component-pagination-dots')

  const numOfDots = sectionList.length

  for (let i = 0; i < numOfDots; i++) {
    const dotHref = window.location.href.replace(thisSection, sectionList[i])
    const numOfThisDot = i + 1

    const dotLink = document.createElement('a')
    dotLink.classList.add('dot')
    dotLink.setAttribute('href', dotHref)
    dotLink.setAttribute('title', `Section ${numOfThisDot} of ${numOfDots}`)

    if (i === thisIndex) {
      dotLink.classList.add('dot-filled')
    }

    dotWrapper.appendChild(dotLink)
  }

  const contentDiv = document.querySelector('.content')
  contentDiv.insertAdjacentElement('beforeend', dotWrapper)
}

function ebComponentMultipleSections (sectionList) {
  // Get the filename of the current page
  const thisSection = window.location.pathname.split('/').pop().split('.')[0]

  if (sectionList.includes(thisSection)) {
    const thisIndex = sectionList.indexOf(thisSection)

    // Need to add pagination to the bottom of the page
    ebComponentPaginationDots(sectionList, thisSection, thisIndex)

    ebComponentPaginationArrows(sectionList, thisSection, thisIndex)
  }
}

function ebGetComponentLength (href) {
  // Get the sections, determine the extent
  const sectionString = ebGetComponentParameters(href).sections

  let sectionList

  if (sectionString) {
    sectionList = sectionString.split(/>|~/)
  } else {
    console.error('Error in the sections argument')
  }

  ebComponentAddTitle(href)

  if (sectionList.length > 1) {
    // This has multiple sections, add pagination
    ebComponentMultipleSections(sectionList)
  }
}

function ebGetComponentParameters (href) {
  const parameterStrings = href.split('?')[1].split('&')
  // [component=true, title=Title, from=(?macroeconomics_)02, id=component-1, sections=01>02>03~04>05]

  const titleString = decodeURIComponent(parameterStrings[1].replace('title=', '')).replace(/\+/gi, ' ')
  const fromString = parameterStrings[2].replace('from=', '') + '.html'

  const idString = '#' + parameterStrings[3].replace('id=', '')
  const sectionString = decodeURIComponent(parameterStrings[4].split('#')[0].replace('sections=', ''))

  return {
    title: titleString,
    from: fromString,
    id: idString,
    sections: sectionString
  }
}

function ebComponentInit () {
  const href = window.location.href

  if (href.includes('component=')) {
    // Add a component class to the wrapper for styling
    document.querySelector('.wrapper').classList.add('component')
    ebGetComponentLength(href)

    if (document.getElementById('share-links')) {
      ebComponentShareLinks(href)
    }
  }
}

export default function ebComponents () {
  ebComponentInit()
}
