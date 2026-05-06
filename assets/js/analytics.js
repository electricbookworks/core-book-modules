/* global  gtag */

import { locales, pageLanguage } from './locales.js'

// ----------------
// USEFUL VARIABLES
// ----------------

// Some functions are called in their feature files, so we need to be able to
// define variables inside some functions, but also globally in this file for
// use by the functions that run here. This function and its output object
// present a solution to this.

function defineVariables () {
  const analyticsVariables = {}

  // pageLanguage is declared in locales.js
  analyticsVariables.languageSignifier = pageLanguage.toUpperCase()
  analyticsVariables.bookTitle = locales[pageLanguage].project.name

  let chapterTitle
  let titlePieces
  let chapterNumber

  if (document.querySelector('h1 strong')) {
    chapterTitle = document.querySelector('h1 strong').innerHTML
    titlePieces = chapterTitle.split(' ')
    chapterNumber = titlePieces[titlePieces.length - 1]
  } else {
    if (document.querySelector('h1')) {
      chapterTitle = document.querySelector('h1').innerHTML
    } else if (document.querySelector('h2')) {
      chapterTitle = document.querySelector('h2').innerHTML
    } else if (document.querySelector('h3')) {
      chapterTitle = document.querySelector('h3').innerHTML
    } else {
      chapterTitle = ''
    }
  }

  analyticsVariables.chapterTitle = chapterTitle
  analyticsVariables.chapterNumber = chapterNumber

  return analyticsVariables
}

const variables = defineVariables()
const languageSignifier = variables.languageSignifier
const bookTitle = variables.bookTitle
const chapterNumber = variables.chapterNumber

// --------------
// BASE FUNCTIONS
// --------------

// Base function to send info to Google Analytics
function ebTrackSendEventToGoogle (eventAction, eventCategory, eventLabel) {
  if (typeof gtag === 'function') {
    gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel
    })
  }
}

// Base function to send analytics upon triggering an event
function ebTrackEvent (target, event, eventAction, eventCategory, eventLabel) {
  target.addEventListener(event, function () {
  // Inform Google Analytics when this event is triggered
    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel)
  })
}

// --------------
// VIDEO TRACKING
// --------------

function ebVideoGetVideoDescription (video) {
  const optionLinks = video.querySelectorAll('.video-options-content a')

  let videoDescription
  let urlPieces

  if (optionLinks.length > 0) {
    optionLinks.forEach(function (link) {
      if (link.href.indexOf('.mp4') !== -1) {
        urlPieces = link.href.split('/')
        videoDescription = urlPieces[urlPieces.length - 1]
        videoDescription = videoDescription.slice(0, -4)
      }
    })
  } else {
    videoDescription = video.getAttribute('data-title')
  }

  return videoDescription
}

function ebTrackYoutubeVideoPlay (video) {
  // This one is called in videos.js
  const variables = defineVariables()
  const languageSignifier = variables.languageSignifier
  const bookTitle = variables.bookTitle
  const chapterTitle = variables.chapterTitle
  const chapterNumber = variables.chapterNumber

  const videoClassList = video.classList

  const eventAction = 'Play video'
  let eventCategory = 'Videos - '
  let eventLabel = null

  const videoDescription = ebVideoGetVideoDescription(video)

  if (videoClassList.contains('walk-through')) {
    let fullChapterTitle
    if (document.querySelector('h1')) {
      fullChapterTitle = document.querySelector('h1').innerHTML
    } else if (document.querySelector('h2')) {
      fullChapterTitle = document.querySelector('h2').innerHTML
    } else {
      fullChapterTitle = ''
    }
    eventCategory += 'Walk-through'

    if (fullChapterTitle.includes('Excel')) {
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' Excel Project ' + chapterNumber + ' - ' + videoDescription
    } else if (fullChapterTitle.includes('Google')) {
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' Google Sheets Project ' + chapterNumber + ' - ' + videoDescription
    } else {
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' R Project ' + chapterNumber + ' - ' + videoDescription
    }
  } else if (videoClassList.contains('economist-in-action')) {
    eventCategory += 'EiA'
    eventLabel = bookTitle + ' ' + languageSignifier + ' ' + chapterTitle + ' - ' + videoDescription
  }

  if (eventLabel !== null) {
    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel)
  }
}

function ebTrackVideoOptionClicks (video) {
  // This one is called in videos.js
  const variables = defineVariables()
  const languageSignifier = variables.languageSignifier
  const bookTitle = variables.bookTitle
  const chapterTitle = variables.chapterTitle

  let eventCategory
  let eventAction

  const optionLinks = video.querySelectorAll('.video-options-content a')
  const videoDescription = ebVideoGetVideoDescription(video)

  const eventLabel = bookTitle + ' ' + languageSignifier + ' ' + chapterTitle + ' - ' + videoDescription

  optionLinks.forEach(function (link) {
    const linkURL = link.href

    if (linkURL.includes('.mp4')) {
      eventCategory = 'Video options - Download'
      eventAction = 'Download video'
    } else if (linkURL.includes('bilibili')) {
      eventCategory = 'Video options - BiliBili'
      eventAction = 'Play video'
    } else if (linkURL.includes('.txt')) {
      eventCategory = 'Video options - Transcript'
      eventAction = 'Download transcript'
    } else {
      eventCategory = 'Video options - Misc'
      eventAction = 'Play video'
    }

    ebTrackEvent(link, 'click', eventAction, eventCategory, eventLabel)
    ebTrackEvent(link, 'contextmenu', eventAction, eventCategory, eventLabel)
  })
}

// ---------------
// BUTTON TRACKING
// ---------------

function ebTrackOwidButtonClicks () {
  const owidButtons = document.querySelectorAll('.figure-more a')

  const eventAction = 'Click on OWiD'
  const eventCategory = 'Button - OWiD'

  owidButtons.forEach(function (owidButton) {
    const figureNumber = owidButton.parentNode.parentNode.parentNode
      .querySelector('.figure-reference').innerHTML.trim()
    const eventLabel = bookTitle + ' ' + languageSignifier + ' ' + figureNumber

    ebTrackEvent(owidButton, 'click', eventAction, eventCategory, eventLabel)
    ebTrackEvent(owidButton, 'contextmenu', eventAction, eventCategory, eventLabel)
  })
}

function ebTrackCheckAnswerButtonClicks () {
  const checkAnswerButtons = document.querySelectorAll('.check-answer-button')

  const eventAction = 'Click on Answer'
  const eventCategory = 'Button - Check Answer'

  if (checkAnswerButtons) {
    checkAnswerButtons.forEach(function (button) {
      const questionNumber = button.parentNode.querySelector('h3 strong')

      if (questionNumber) {
        const eventLabel = bookTitle + ' ' + languageSignifier + ' ' + questionNumber.innerHTML
        ebTrackEvent(button, 'click', eventAction, eventCategory, eventLabel)
      } else {
        console.error('Question does not have a bold number in its heading. See: ' + button.parentNode.innerHTML)
      }
    })
  }
}

// --------------------------
// EMPIRICAL PROJECT TRACKING
// --------------------------

function ebTrackEmpiricalProjectViews () {
  let fullChapterTitle
  if (document.querySelector('h1')) {
    fullChapterTitle = document.querySelector('h1').innerHTML
  } else if (document.querySelector('h2')) {
    fullChapterTitle = document.querySelector('h2').innerHTML
  } else {
    fullChapterTitle = ''
  }

  const thisIsAProjectPage = document.querySelector('body.project')
  const eventAction = 'View project'
  let eventCategory
  let eventLabel

  if (thisIsAProjectPage) {
    if (fullChapterTitle.includes('Excel')) {
      eventCategory = 'Empirical Project - Excel'
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' - Excel Project ' + chapterNumber
    } else if (fullChapterTitle.includes('Google')) {
      eventCategory = 'Empirical Project - Google Sheets'
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' - Google Sheets Project ' + chapterNumber
    } else {
      eventCategory = 'Empirical Project - R'
      eventLabel = bookTitle + ' ' + languageSignifier +
        ' - R Project ' + chapterNumber
    }

    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel)
  }
}

function ebTrackRCodeDownloads () {
  const rDownloadLink = document.querySelector('.js-code-download-link')

  if (rDownloadLink) {
    const eventAction = 'Download code'
    const eventCategory = 'Code download - R'
    const eventLabel = bookTitle + ' ' + languageSignifier + ' - R Project ' + chapterNumber

    ebTrackEvent(rDownloadLink, 'click', eventAction, eventCategory, eventLabel)
    ebTrackEvent(rDownloadLink, 'contextmenu', eventAction, eventCategory, eventLabel)
  }
}

function ebTrackExpandableBoxOpen (h3) {
  // This one is called in expandable-box.js

  const eventAction = 'Expand walk-through'
  let eventCategory = ''
  let eventLabel = ''

  const headingPieces = h3.split(' ')
  const boxNumber = headingPieces[headingPieces.length - 1]

  if (h3.includes('excel')) {
    eventCategory = 'Walk-through - Excel'
    eventLabel = 'Excel Walk-through ' + boxNumber
  } else if (h3.includes('google')) {
    eventCategory = 'Walk-through - Google Sheets'
    eventLabel = 'Google Sheets Walk-through ' + boxNumber
  } else {
    eventCategory = 'Walk-through - R'
    eventLabel = 'R Walk-through ' + boxNumber
  }

  ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel)
}

export default function ebAnalytics () {
  ebTrackOwidButtonClicks()
  ebTrackCheckAnswerButtonClicks()
  ebTrackEmpiricalProjectViews()
  ebTrackRCodeDownloads()
}

export {
  ebTrackVideoOptionClicks,
  ebTrackYoutubeVideoPlay,
  ebTrackExpandableBoxOpen
}
