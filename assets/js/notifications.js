// Manage notifications

function ebNotificationCloseButton (element, index) {
  const checkbox = document.createElement('input')
  checkbox.setAttribute('type', 'checkbox')
  checkbox.setAttribute('name', 'notification-' + index)
  checkbox.setAttribute('id', 'notification-' + index)
  checkbox.classList.add('notification-close-button')
  checkbox.style.display = 'none'
  element.appendChild(checkbox)

  // With the box hidden, let user click a label
  const checkboxLabel = document.createElement('label')
  checkboxLabel.innerHTML = '×'
  checkboxLabel.setAttribute('for', 'notification-' + index)
  checkboxLabel.style.display = 'inline-block'
  checkboxLabel.style.width = 'auto'
  checkboxLabel.style.color = 'grey'
  checkboxLabel.style.marginLeft = '2em'
  element.appendChild(checkboxLabel)

  // Hide on click
  checkbox.addEventListener('click', function () {
    checkbox.parentNode.style.display = 'none'
  })
}

export default function ebNotifications () {
  const notifications = document.querySelectorAll('.notification')
  notifications.forEach(function (notification, index) {
    ebNotificationCloseButton(notification, index)
  })
}
