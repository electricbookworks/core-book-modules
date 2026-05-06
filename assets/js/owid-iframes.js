function showInteractiveGraph (button, staticVersion = true) {
  // Hide the "Show interactive graph" button
  button.classList.add('visuallyhidden')
  button.setAttribute('tabindex', '-1')

  // Find the "Show static graph" button and make it visible
  if (staticVersion) {
    const staticButton = button.parentElement.querySelector('.js-static')
    staticButton.classList.remove('visuallyhidden')
    staticButton.setAttribute('tabindex', '0')
    staticButton.focus()
  }

  const iframeLink = button.getAttribute('data-link')

  // Make the new iframe element
  const iframeElement = document.createElement('iframe')
  iframeElement.setAttribute('src', iframeLink)
  iframeElement.setAttribute('loading', 'lazy')
  // Add class to the iframe for styling
  iframeElement.classList.add('owid-iframe')

  if (button.closest('.slides') !== null) {
    // Sometimes the iframe needs to replace an entire set of slides
    const slideDiv = button.closest('.slides')
    // Add a class to the slide div for styling
    slideDiv.classList.add('contains-iframe')
    // Make the slide nav invisible
    const slideNav = slideDiv.querySelector('.nav-slides')
    slideNav.classList.add('visuallyhidden')

    // Make the slides themselves invisible with their captions
    const slideFigures = slideDiv.querySelectorAll('.figure')
    slideFigures.forEach(function (figure) {
      figure.classList.add('visuallyhidden')
    })

    // Put the iframeElement after the last (invisible) figure
    const lastSlide = slideFigures[slideFigures.length - 1]
    const figureMeta = lastSlide.parentElement.querySelector('.figure-summary-meta')
    figureMeta.parentElement.insertBefore(iframeElement, figureMeta)
  } else {
    // Other times it only needs to replace a standalone figure
    // Get the figure container
    const figureDiv = button.closest('.figure').querySelector('.figure-images')
    // Make it invisible
    figureDiv.classList.add('visuallyhidden')
    // Put the iframeElement after the (invisible) figure
    const figureCaption = figureDiv.parentElement.querySelector('.caption')
    figureCaption.parentElement.insertBefore(iframeElement, figureCaption)
  }
}

function showStaticGraph (button) {
  // If the iframe is currently showing, switch to static image/slides
  button.classList.add('visuallyhidden')
  button.setAttribute('tabindex', '-1')

  const interactiveButtons = button.parentElement.querySelectorAll('.js-interactive')
  interactiveButtons.forEach(function (interactiveButton) {
    interactiveButton.classList.remove('visuallyhidden')
    interactiveButton.setAttribute('tabindex', '0')
  })

  interactiveButtons[0].focus()

  // If we're dealing with a set of slides
  if (button.closest('.slides') !== null) {
    // Get the iframe element
    const iframeElements = button.closest('.slides').querySelectorAll('iframe.owid-iframe')
    iframeElements.forEach(function (iframeElement) {
      // Remove it from the DOM
      iframeElement.remove()
    })

    const slideDiv = button.closest('.slides')
    // Remove the styling class
    slideDiv.classList.remove('contains-iframe')
    // Make the slide nav visible again
    const slideNav = slideDiv.querySelector('.nav-slides')
    slideNav.classList.remove('visuallyhidden')

    // Find the slide that we were on before and make it visible
    const currentSlideItems = slideNav.querySelectorAll('li.slide-current')
    let currentSlideNav = currentSlideItems[currentSlideItems.length - 1]

    if (!currentSlideNav) {
      currentSlideNav = slideNav.querySelector('li')
    }

    const currentSlideNavLink = currentSlideNav.querySelector('a').href
    const currentSlideID = currentSlideNavLink.split('#')[1]
    const currentSlide = document.getElementById(currentSlideID)
    currentSlide.classList.remove('visuallyhidden')
  } else {
    // If we're dealing with a standalone figure
    // Get the iframe element
    const iframeElements = button.closest('.figure').querySelectorAll('iframe.owid-iframe')
    iframeElements.forEach(function (iframeElement) {
      // Remove it from the DOM
      iframeElement.remove()
    })
    // Bring back the figure
    const figure = button.closest('.figure').querySelector('.figure-images')
    figure.classList.remove('visuallyhidden')
  }
}

function ebIframeSwitcher () {
  const iframeSwitcherButtons = document.querySelectorAll('.load-iframe-button')

  // For figures with the 'start-interactive' class, automatically load the
  // iframe, and hide the "View static graph" button
  iframeSwitcherButtons.forEach(function (button) {
    if (button.classList.contains('start-interactive')) {
      showInteractiveGraph(button, false)
    }

    button.addEventListener('click', function () {
      // If the static image is currently showing, switch to iframe
      if (button.classList.contains('js-interactive')) {
        showInteractiveGraph(button)
      } else {
        showStaticGraph(button)
      }
    })
  })
}

ebIframeSwitcher()

function ebGraphOptionsDropdown () {
  const graphOptionsButtons = document.querySelectorAll('button.graph-options')

  graphOptionsButtons.forEach(function (button) {
    const dropdown = button.nextElementSibling
    const options = dropdown.querySelectorAll('a, button')

    button.addEventListener('click', function () {
      dropdown.classList.toggle('visuallyhidden')
      options.forEach(function (option) {
        // if (option.getAttribute("tabindex") === "-1") {
        if (option.classList.contains('visuallyhidden')) {
          option.setAttribute('tabindex', '-1')
        } else {
          option.setAttribute('tabindex', '0')
        }
      })
    })

    // Keyboard access
    function ebHideDropdown (event) {
      if (event.key === 'Escape' && !dropdown.classList.contains('visuallyhidden')) {
        dropdown.classList.add('visuallyhidden')
        options.forEach(function (option) {
          option.setAttribute('tabindex', '-1')
        })
        button.focus()
      }
    }

    button.addEventListener('keydown', ebHideDropdown)
    dropdown.addEventListener('keydown', ebHideDropdown)
  })
}

export default function ebOwidIframes () {
  ebGraphOptionsDropdown()
}
