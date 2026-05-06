/* globals Storage, localStorage */

// Lets user switch to dark mode,
// and saves their choice to localStorage.

// Check for browser support
function ebDarkMarkSupport () {
  if (window.localStorage &&
            Storage !== 'undefined') {
    return true
  }
}

// Save user preference to local storage
function ebDarkModeSave (status) {
  if (window.localStorage &&
            Storage !== 'undefined') {
    localStorage.setItem('dark-mode', status)
  }
}

// Turn on dark mode
function ebDarkModeOn () {
  document.body.classList.add('dark-mode')
  ebDarkModeSave('on')
}

// Turn off dark mode
function ebDarkModeOff () {
  document.body.classList.remove('dark-mode')
  ebDarkModeSave('off')
}

// Toggle dark mode
function ebDarkModeToggle () {
  if (localStorage.getItem('dark-mode') === 'on') {
    ebDarkModeOff()
  } else {
    ebDarkModeOn()
  }
}

// Check for the saved mode and apply it,
// then listen for clicks to toggle mode
export default function ebDarkMode () {
  // Exit if no support
  if (ebDarkMarkSupport() !== true) {
    return
  }

  // If stored value is on, turn on dark mode
  const status = localStorage.getItem('dark-mode')
  if (status === 'on') {
    ebDarkModeOn()
  }

  // Show the button
  const darkModeControl = document.querySelector('.dark-mode-control')

  if (darkModeControl !== null) {
    darkModeControl.classList.remove('visuallyhidden')

    // Listen for clicks on it
    darkModeControl.addEventListener('click', function () {
      ebDarkModeToggle()
    })
    darkModeControl.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        ebDarkModeToggle()
      }
    })
  }
}
