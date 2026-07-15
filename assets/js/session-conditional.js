// This module can be used for any session conditional logic.
// Currently, it's only used for custom links, but it could be used for other things in the future.

export default async function ebSessionConditional () {
  const sessionConditionalElements = document.querySelectorAll('.js-session-conditional')
  if (!sessionConditionalElements || sessionConditionalElements.length === 0) {
    return
  }
  let userSession = null
  try {
    const response = await fetch('/api/session/', {
      headers: {
        cache: 'no-store',
        'content-type': 'application/json; charset=UTF-8'
      }
    })
    userSession = await response.json()
  } catch (error) {
    // Do nothing
  }
  if (userSession && userSession.user_role) {
    sessionConditionalElements.forEach(element => {
      const permittedRoles = element.dataset.userRoles.split(',').map(role => role.trim().toLowerCase())
      if (element.dataset.permittedHref && permittedRoles.includes(userSession.user_role)) {
        element.href = element.dataset.permittedHref
      }
    })
  }
}
