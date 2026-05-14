function ebShareButtonsKeyboardAccess (shareModal, shareButtons) {
  shareButtons.forEach(function (button) {
    button.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        ebShowHideShareModal(shareModal)

        if (!shareModal.classList.contains('share-hidden') && button.classList.contains('share-button')) {
          // Jump focus to the first share link in the modal when it's opened
          const firstLink = shareModal.querySelector('.share-link-content')
          firstLink.focus()
        } else {
          // Jump focus back to controls when modal is closed
          const controlButton = document.querySelector('.share-button')
          controlButton.focus()
        }
      }
    })
  })

  // Close modal when it's open and Escape key is pressed
  shareModal.querySelectorAll('.share-link-content, .share-links-close').forEach(function (item) {
    item.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        ebShowHideShareModal(shareModal)

        // Jump focus back to controls when modal is closed
        const controlButton = document.querySelector('.share-button')
        controlButton.focus()
      }
    })
  })
}

function ebShowHideShareModal (shareModal) {
  shareModal.classList.toggle('share-hidden')
  const buttonIcon = document.querySelector('.share-button svg')
  buttonIcon.classList.toggle('active')
}

function ebShareButtons () {
  // Move the panel out of controls, so we can
  // position it anywhere on the page with CSS.
  const shareModal = document.getElementById('share-links')

  if (shareModal) {
    document.body.appendChild(shareModal)
  }

  const shareButtons = document.querySelectorAll('.share-button, .share-links-close')

  if (shareButtons && shareModal) {
    shareButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        ebShowHideShareModal(shareModal)
      })
    })

    ebShareButtonsKeyboardAccess(shareModal, shareButtons)
  }
}

export default function ebShare () {
  ebShareButtons()
}
