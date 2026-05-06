import { locales, pageLanguage } from './locales'

const ebToggleFullscreenImage = function (event) {
  const button = event.target
  let figureContainer = button.closest('.figure-images')

  if (figureContainer && figureContainer.requestFullscreen) {
    if (!document.fullscreenElement) {
      figureContainer.requestFullscreen()
      figureContainer.classList.add('fullscreen')
      button.innerHTML = locales[pageLanguage].figures['exit-fullscreen']
    } else if (document.exitFullscreen) {
      figureContainer = button.closest('.figure-images')
      figureContainer.classList.remove('fullscreen')
      button.innerHTML = locales[pageLanguage].figures['enter-fullscreen']
      document.exitFullscreen()
    }
  }
}

export default function ebFullscreenImages () {
  // Find the icons
  const fullscreenButtons = document.querySelectorAll('.fullscreen-button')

  // For each icon
  if (fullscreenButtons && fullscreenButtons.length > 0) {
    fullscreenButtons.forEach(function (button) {
      button.addEventListener('click', ebToggleFullscreenImage)
      button.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          ebToggleFullscreenImage(event)
        }
      })
    })
  }

  // If we exit fullscreen (e.g. with Esc key)
  // make sure no image has a fullscreen class.
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) {
      const fullscreenElements = document.querySelectorAll('.figure-images.fullscreen')

      fullscreenElements.forEach(function (fullscreenElement) {
        fullscreenElement.classList.remove('fullscreen')

        const button = fullscreenElement.querySelector('.fullscreen-button')
        button.innerHTML = locales[pageLanguage].figures['enter-fullscreen']
      })
    }
  })
}
