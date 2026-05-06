import { ebToggleClickout } from './utilities'
const settings = process.env.settings

/*
ACCORDION BEHAVIOUR ON THE LANDING PAGE
*/

function ebLandingPageAccordionAction (parentClass, parentSection, parentHeading, upArrow, downArrow) {
  parentSection.classList.toggle(parentClass + '-open')
  parentSection.classList.toggle(parentClass + '-closed')
  upArrow.classList.toggle('visuallyhidden')
  downArrow.classList.toggle('visuallyhidden')

  const storageKey = 'accordion-' + parentHeading.id

  if (parentSection.classList.contains(parentClass + '-open')) {
    window.localStorage.setItem(storageKey, 'open')
  } else {
    window.localStorage.setItem(storageKey, 'closed')
  }
}

function ebLandingPageAccordionStart (parentClass, parentSection, parentHeading, upArrow, downArrow) {
  // Get the default visual-TOC position
  const defaultPosition = settings[process.env.output]['landing-page']['visual-toc-accordion-default'] === 'open' ? 'open' : 'closed'

  // Look at localStorage to see whether the user left the page in non-default state
  const storageKey = 'accordion-' + parentHeading.id

  // If the user changed a section position last time, do that again
  if (window.localStorage.getItem(storageKey) !== defaultPosition) {
    ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow)
  }
}

function ebLandingPageAccordion () {
  // Get the accordion buttons on the landing page
  const landingPageAccordionButtons = document.querySelectorAll('.landing-page-accordion-head')

  if (landingPageAccordionButtons) {
    landingPageAccordionButtons.forEach(function (button) {
      //
      const parentSection = button.closest('.landing-page-toc-section, .landing-page-flex-section')
      const parentClass = parentSection.classList.contains('landing-page-toc-section') ? 'landing-page-toc-section' : 'landing-page-flex-section'
      const parentHeading = button.closest('h2, h3')
      const upArrow = button.querySelector('.arrow-up')
      const downArrow = button.querySelector('.arrow-down')

      // If the user has visited the page before, get the page looking how they left it
      ebLandingPageAccordionStart(parentClass, parentSection, parentHeading, upArrow, downArrow)

      // Listen for clicks to open and close sections
      button.addEventListener('click', function () {
        ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow)
      })
    })
  }
}

/*
NAV BEHAVIOUR ON THE LANDING PAGE
*/

function ebLandingPageNavLinks (navElement) {
  const navLinks = navElement.querySelectorAll('a')
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      ebToggleClickout(navElement, function () {
        navElement.classList.toggle('invisible')
        ebLandingPageNavToggleAccess(navElement)
      })
    })
  })
}

function ebLandingPageNavToggleAccess (navElement) {
  // Nav elements that are not visible should not be keyboard accessible

  const navItems = navElement.querySelectorAll('input.search-box, a')
  if (navElement.classList.contains('invisible')) {
    navItems.forEach(function (item) {
      item.setAttribute('tabindex', '-1')
    })
  } else {
    navItems.forEach(function (item) {
      item.setAttribute('tabindex', '0')
    })
  }
}

function ebLandingPageNavKeyboardAccess (navButton, navElement) {
  const navButtonSVG = navButton.querySelector('svg')
  const navButtonStyles = window.getComputedStyle(navButtonSVG)

  if (navButtonStyles.display === 'none') {
    // WIDE SCREEN
    // Hamburger is inaccessible
    navButton.setAttribute('tabindex', '-1')
    // Nav elements are accessible by default
  } else {
    // NARROW SCREEN
    // Hamburger is accessible
    navButton.setAttribute('tabindex', '0')
    // Nav elements are inaccessible to begin with
    // since nav list is invisible to begin with
    ebLandingPageNavToggleAccess(navElement)

    // Visibility and access to nav items is toggled
    navElement.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        ebToggleClickout(navElement, function () {
          navElement.classList.toggle('invisible')
          ebLandingPageNavToggleAccess(navElement)
        })
      }
    })

    // Listen for clicks on the nav child links
    ebLandingPageNavLinks(navElement)

    // Listen for clicks on the hamburger button
    navButton.addEventListener('click', function () {
      // Toggle the visibility of the nav and the clickout region
      ebToggleClickout(navElement, function () {
        navElement.classList.toggle('invisible')
        ebLandingPageNavToggleAccess(navElement)
      })
    })
  }
}

function ebLandingPageNav () {
  // Check whether we're on the landing page
  if (document.querySelector('.landing-page')) {
    const navButton = document.querySelector('button.masthead-menu')
    const navElement = document.getElementById('landing-page-nav')
    ebLandingPageNavKeyboardAccess(navButton, navElement)
  }
}

/*
LANGUAGE SWITCHER ON THE LANDING PAGE
*/

function ebLandingPageLanguageSwitcher () {
  // Check whether we're on the landing page
  if (document.querySelector('.landing-page') && document.querySelector('select#translations')) {
    const languageSelector = document.querySelector('select#translations')

    // Add an event listener
    languageSelector.addEventListener('input', function () {
      const selectedOption = languageSelector.options[languageSelector.selectedIndex]
      const newPath = selectedOption.getAttribute('data-path')

      // Construct the new href from the existing one
      const origin = new URL(window.location.href).origin
      const destination = origin + newPath

      // Reassigning window.location.href naviagtes to that new href
      window.location.href = destination
    })
  }
}

export default function ebLandingPage () {
  ebLandingPageAccordion()
  ebLandingPageNav()
  ebLandingPageLanguageSwitcher()
}
